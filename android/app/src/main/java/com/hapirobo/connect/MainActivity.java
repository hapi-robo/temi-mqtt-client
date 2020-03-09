package com.hapirobo.connect;

import android.os.Bundle;
import android.util.Log;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.robotemi.sdk.BatteryData;
import com.robotemi.sdk.Robot;
import com.robotemi.sdk.TtsRequest;
import com.robotemi.sdk.listeners.OnBatteryStatusChangedListener;
import com.robotemi.sdk.listeners.OnGoToLocationStatusChangedListener;
import com.robotemi.sdk.listeners.OnRobotReadyListener;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.jetbrains.annotations.NotNull;
import org.jitsi.meet.sdk.JitsiMeet;
import org.jitsi.meet.sdk.JitsiMeetActivity;
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class MainActivity extends JitsiMeetActivity implements
        OnRobotReadyListener,
        OnBatteryStatusChangedListener,
        OnGoToLocationStatusChangedListener {

    private static final String TAG_MQTT = "PahoMQTT";
    private static final String TAG_ROBOT = "temiSDK";

    private Robot robot;
    private String serialNumber;
    private MqttAndroidClient mqttClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // initialize robot
        robot = Robot.getInstance();

        // initialize Jitsi server URL
        URL serverURL;
        try {
            serverURL = new URL("https://meet.jit.si");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new RuntimeException("Invalid server URL!");
        }

        // set Jitsi-Meet options
        JitsiMeetConferenceOptions defaultOptions
                = new JitsiMeetConferenceOptions.Builder()
                .setServerURL(serverURL)
                .setWelcomePageEnabled(false)
                .build();
        JitsiMeet.setDefaultConferenceOptions(defaultOptions);
    }

    @Override
    protected void onStart() {
        super.onStart();

        // add robot listeners
        robot.addOnRobotReadyListener(this);
        robot.addOnBatteryStatusChangedListener(this);
        robot.addOnGoToLocationStatusChangedListener(this);
    }

    @Override
    protected void onResume() {
        super.onResume();

        // re-initialize MQTT client
//         EditText hostNameView = findViewById(R.id.hostNameEditText);
//        String hostURI = "tcp://" + hostNameView.getText().toString().trim() + ":1883";
//        String hostURI = "tcp://192.168.0.118:1883";
//        initMQTT(hostURI);
    }

    @Override
    protected void onStop() {
        super.onStop();

        // disconnect MQTT client
        try {
            mqttClient.disconnect();
        } catch (MqttException e) {
            e.printStackTrace();
        }

        // remove robot listeners
        robot.removeOnRobotReadyListener(this);
        robot.removeOnBatteryStatusChangedListener(this);
        robot.removeOnGoToLocationStatusChangedListener(this);
    }

    @Override
    public void onRobotReady(boolean isReady) {
        if (isReady) {
            serialNumber = robot.getSerialNumber();

            // connect to MQTT broker
            String hostURI = "tcp://192.168.0.118:1883";
            initMQTT(hostURI);

            // hide temi's top bar
            robot.hideTopBar();

            // disable robot's navigation billboard
            // note: this will only work in kiosk-mode
            robot.toggleNavigationBillboard(true);
            Log.v(TAG_ROBOT, "[STATUS][READY]");

            // Build options object for joining the conference.
            // The SDK will merge the default one with this one when joining.
            // ref: https://github.com/jitsi/jitsi-meet/blob/master/android/sdk/src/main/java/org/jitsi/meet/sdk/JitsiMeetConferenceOptions.java
            JitsiMeetConferenceOptions options
                    = new JitsiMeetConferenceOptions.Builder()
                    .setRoom("temi-" + serialNumber)
                    .setAudioMuted(false)
                    .setVideoMuted(false)
                    .setAudioOnly(false)
                    .setWelcomePageEnabled(false)
                    .build();

            // Launch the new activity with the given options. The launch() method takes care
            // of creating the required Intent and passing the options.
//            JitsiMeetActivity.launch(this, options);
        }
    }

    /**
     * onBatteryStatusChanged
     * @param batteryData Battery data object
     */
    @Override
    public void onBatteryStatusChanged(BatteryData batteryData) {
        JSONObject payload = new JSONObject();

        try {
            payload.put("percentage", batteryData.getBatteryPercentage());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            payload.put("is_charging", batteryData.isCharging());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
            mqttClient.publish("temi/" + serialNumber + "/status/utils/battery", message);
            Log.v(TAG_ROBOT, "[STATUS][BATTERY] " + batteryData.getBatteryPercentage() + "% | " + batteryData.isCharging());
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * onGoToLocationStatusChanged
     * @param location Location name
     * @param status ['start', 'calculating', 'going', 'complete', 'abort']
     * @param descriptionId Description identifier
     * @param description Text description
     */
    @Override
    public void onGoToLocationStatusChanged(@NotNull String location, @NotNull String status, int descriptionId, @NotNull String description) {
        JSONObject payload = new JSONObject();

        try {
            payload.put("location", location);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            payload.put("status", status);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            payload.put("description_id", descriptionId);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            payload.put("description", description);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
            mqttClient.publish("temi/" + serialNumber + "/status/locations/goto", message);
            Log.v(TAG_ROBOT, "[STATUS][GOTO] Location: " + location + " | Status: " + status);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * Initialize MQTT client
     */
    private void initMQTT(String hostURI) {
        mqttClient = new MqttAndroidClient(getApplicationContext(), hostURI, "temi-" + serialNumber);
        mqttClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                // this method is called when connection to server is lost
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
                // called when delivery for a message has been completed, and all acknowledgements have been received
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws Exception {
                // this method is called when a message arrives from the server
                Log.v(TAG_MQTT, topic);
                Log.v(TAG_MQTT, message.toString());
                parseMessage(topic, message);
            }
        });

        MqttConnectOptions mqttConnectOptions = new MqttConnectOptions();
        mqttConnectOptions.setAutomaticReconnect(true);
        mqttConnectOptions.setCleanSession(true);
        mqttConnectOptions.setConnectionTimeout(10);

        try {
            mqttClient.connect(mqttConnectOptions, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Toast.makeText(MainActivity.this, "Successfully Connected", Toast.LENGTH_SHORT).show();
                    try {
                        mqttClient.subscribe("temi/+/command/#", 1);
                    } catch (MqttException e) {
                        e.printStackTrace();
                    }
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Toast.makeText(MainActivity.this, "Failed to Connect", Toast.LENGTH_SHORT).show();
                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * Message parser
     * @param topic MQTT topic
     * @param message MQTT message payload
     * @throws JSONException JSON exception
     */
    private void parseMessage(String topic, MqttMessage message) throws JSONException {
        String[] topic_tree = topic.split("/");
        String robot_id = topic_tree[1];
        String type = topic_tree[2];
        String category = topic_tree[3];
        String command = topic_tree[4];

        Log.d(TAG_MQTT, "Robot-ID: " + robot_id);
        Log.d(TAG_MQTT, "Type: " + type);
        Log.d(TAG_MQTT, "Category: " + category);
        Log.d(TAG_MQTT, "Command: " + command);

        if (robot_id.equals(serialNumber)) {
            JSONObject payload = new JSONObject(message.toString());

            switch (category) {
                case "follow":
                    parseFollow(command);
                    break;
                case "locations":
                    parseLocations(command, payload);
                    break;
                case "movement":
                    parseMovement(command, payload);
                    break;
                case "speech":
                    parseSpeech(command, payload);
                    break;
                case "info":
                    try {
                        robotPublishLocations();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    break;
                default:
                    Log.d(TAG_MQTT, "[PARSER] Bad topic: " + topic);
                    break;
            }
        }
    }

    /**
     * Parse Follow message
     * @param command Follow Command
     */
    private void parseFollow(String command) {
        Log.v(TAG_MQTT, "[CMD][FOLLOW] " + command);

        switch (command) {
            case "unconstrained":
                robot.beWithMe();
                break;
            case "constrained":
                robot.constraintBeWith();
                break;
            case "stop":
                robot.stopMovement();
                break;
            default:
                Log.v(TAG_MQTT, "[FOLLOW] Unknown Follow-Type");
                break;
        }
    }

    /**
     * Parse Locations message
     * @param command Location command
     * @param payload Location payload
     * @throws JSONException JSON exception
     */
    private void parseLocations(String command, JSONObject payload) throws JSONException {
        String location_name = payload.getString("location");
        Log.v(TAG_MQTT, "[CMD][LOCATIONS] " + command + " | " + location_name);

        switch (command) {
            case "save":
                robot.saveLocation(location_name);
                break;
            case "delete":
                robot.deleteLocation(payload.getString(location_name));
                break;
            case "goto":
                // check that the location exists, then go to that location
                for (String location : robot.getLocations()){
                    if (location.equals(location_name.toLowerCase().trim())) {
                        robot.goTo(location_name.toLowerCase().trim());
                    }
                }
                break;
            default:
                Log.v(TAG_MQTT, "[LOCATIONS] Unknown Locations Command");
                break;
        }
    }

    /**
     * Parse Movement message
     * @param command Movement command
     * @param payload Movement payload
     * @throws JSONException JSON exception
     */
    private void parseMovement(String command, JSONObject payload) throws JSONException {
        Log.v(TAG_MQTT, "[CMD][MOVE] " + command);

        switch (command) {
            case "joystick":
                float x = Float.parseFloat(payload.getString("x"));
                float y = Float.parseFloat(payload.getString("y"));
                Log.v(TAG_MQTT, "x: " + x + " | y: " + y);
                robot.skidJoy(x, y);
                break;
            case "turn_by":
                robot.turnBy(Integer.parseInt(payload.getString("angle")));
                break;
            case "tilt":
                robot.tiltAngle(Integer.parseInt(payload.getString("angle")));
                break;
            case "tilt_by":
                robot.tiltBy(Integer.parseInt(payload.getString("angle")));
                break;
            case "stop":
                robot.stopMovement();
                break;
            default:
                Log.v(TAG_MQTT, "[MOVE] Unknown Movement Command");
                break;
        }
    }

    /**
     * Parse Speech messages
     * @param command Speech command
     * @param payload Speech payload
     * @throws JSONException JSON exception
     */
    private void parseSpeech(String command, JSONObject payload) throws JSONException {
        Log.v(TAG_MQTT, "[CMD][SPEECH] " + command);

        switch (command) {
            case "speak":
                String tts = payload.getString("value");
                robot.speak(TtsRequest.create(tts,false));
                break;
            case "cancel":
                robot.cancelAllTtsRequests();
                break;
            case "wakeup":
                robot.wakeup();
                break;
            default:
                Log.v(TAG_MQTT, "[SPEECH] Unknown Speech Command");
                break;
        }
    }

    /**
     * Publish saved locations
     * @throws JSONException JSON exception
     */
    private void robotPublishLocations() throws JSONException {
        JSONObject payload = new JSONObject();
        JSONArray location_list = new JSONArray();

        List<String> locations = robot.getLocations();

        for (String location : locations) {
            location_list.put(location);
            Log.v(TAG_ROBOT, location);
        }
        payload.put("size", Integer.valueOf(locations.size()));
        payload.put("locations", location_list);

        try {
            MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
            mqttClient.publish("temi/" + serialNumber + "/info/locations", message);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}
