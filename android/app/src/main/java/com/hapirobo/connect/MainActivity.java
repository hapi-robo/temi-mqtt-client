package com.hapirobo.connect;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.Toast;

import com.robotemi.sdk.BatteryData;
import com.robotemi.sdk.Robot;
import com.robotemi.sdk.listeners.OnBatteryStatusChangedListener;
import com.robotemi.sdk.listeners.OnDetectionStateChangedListener;
import com.robotemi.sdk.listeners.OnGoToLocationStatusChangedListener;
import com.robotemi.sdk.listeners.OnRobotReadyListener;
import com.robotemi.sdk.listeners.OnUserInteractionChangedListener;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
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
import java.util.Objects;

public class MainActivity extends AppCompatActivity implements
        OnRobotReadyListener,
        OnBatteryStatusChangedListener,
        OnGoToLocationStatusChangedListener,
        OnDetectionStateChangedListener,
        OnUserInteractionChangedListener {
    private static final String TAG = "DEBUG";

    private static Handler sHandler = new Handler();
    private static Robot sRobot;
    private static String sSerialNumber;
    private MqttAndroidClient mMqttClient;
    private Runnable periodicTask = new Runnable() {
        // periodically publishes robot status to the MQTT broker.
        @Override
        public void run() {
            Log.v(TAG, "Publish status");
            sHandler.postDelayed(this, 3000);

            try {
                MainActivity.this.robotPublishStatus();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    };

    /**
     * Initializes robot instance and default Jitsi-meet conference options.
     * @param savedInstanceState
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // initialize robot
        sRobot = Robot.getInstance();

        // initialize default options for Jitsi Meet conferences.
        URL serverUrl;
        try {
            serverUrl = new URL("https://meet.jit.si");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new RuntimeException("Invalid server URL!");
        }
        JitsiMeetConferenceOptions defaultOptions
            = new JitsiMeetConferenceOptions.Builder()
                .setServerURL(serverUrl)
                .setWelcomePageEnabled(false)
                .build();
        JitsiMeet.setDefaultConferenceOptions(defaultOptions);
    }

    /**
     * Adds robot event listeners.
     */
    @Override
    protected void onStart() {
        super.onStart();
        sRobot.addOnRobotReadyListener(this);
        sRobot.addOnBatteryStatusChangedListener(this);
        sRobot.addOnGoToLocationStatusChangedListener(this);
        sRobot.addOnDetectionStateChangedListener(this);
        sRobot.addOnUserInteractionChangedListener(this);
    }

    /**
     * Removes robot event listeners.
     */
    @Override
    protected void onStop() {
        super.onStop();
        sRobot.removeOnRobotReadyListener(this);
        sRobot.removeOnBatteryStatusChangedListener(this);
        sRobot.removeOnGoToLocationStatusChangedListener(this);
        sRobot.removeDetectionStateChangedListener(this);
        sRobot.removeOnUserInteractionChangedListener(this);
    }

    /**
     * Disconnects MQTT client from broker.
     */
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mMqttClient != null && mMqttClient.isConnected()) {
            try {
                Log.i(TAG, "[MQTT] Disconnecting MQTT client from broker");
                mMqttClient.unsubscribe("temi/" + sSerialNumber + "/command/#");
                mMqttClient.disconnect();
                Log.i(TAG, "[MQTT] Done");
            } catch (MqttException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Configures robot after it is ready.
     * @param isReady True if robot initialized correctly; False otherwise
     */
    @Override
    public void onRobotReady(boolean isReady) {
        if (isReady) {
            sSerialNumber = sRobot.getSerialNumber();
            sRobot.hideTopBar(); // hides temi's top menu bar
            sRobot.toggleNavigationBillboard(true); // hides navigation billboard
            Log.i(TAG, "[ROBOT][READY]");
        }
    }

    /**
     * Handles battery update events.
     * @param batteryData Object containing battery state
     */
    @Override
    public void onBatteryStatusChanged(@Nullable BatteryData batteryData) {
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
            if (mMqttClient != null && mMqttClient.isConnected()) {
                MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
                mMqttClient.publish("temi/" + sSerialNumber + "/status/utils/battery", message);
            }
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * Handles go-to event updates.
     * @param location Go-to location name
     * @param status Current status
     * @param descriptionId Description-identifier of the event
     * @param description Verbose description of the event
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
            if (mMqttClient != null && mMqttClient.isConnected()) {
                MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
                mMqttClient.publish("temi/" + sSerialNumber + "/event/waypoint/goto", message);
            }
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDetectionStateChanged(int state) {
        JSONObject payload = new JSONObject();

        try {
            payload.put("state", state);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            if (mMqttClient != null && mMqttClient.isConnected()) {
                MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
                mMqttClient.publish("temi/" + sSerialNumber + "/event/user/detection", message);
            }
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onUserInteraction(boolean isInteracting) {
        JSONObject payload = new JSONObject();

        try {
            payload.put("is_interacting", isInteracting);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        try {
            if (mMqttClient != null && mMqttClient.isConnected()) {
                MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
                mMqttClient.publish("temi/" + sSerialNumber + "/event/user/interaction", message);
            }
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * Connects to MQTT broker.
     * @param v View context
     */
    public void onButtonClick(View v) {
        EditText hostNameView = findViewById(R.id.edit_text_host_name);
        String hostUri = "tcp://" + hostNameView.getText().toString().trim() + ":1883";

        // hide keyboard
        InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(hostNameView.getWindowToken(), 0);


        // initialize MQTT
        if (mMqttClient != null && mMqttClient.isConnected() && hostUri.equals(mMqttClient.getServerURI())) {
            Toast.makeText(MainActivity.this, "Already Connected", Toast.LENGTH_SHORT).show();
            Log.i(TAG, "Already connected to MQTT broker");
        } else {
            initMqtt(hostUri, "temi-" + sSerialNumber);
        }
    }

    /**
     * Publish robot status information.
     * @throws JSONException
     */
    public void robotPublishStatus() throws JSONException {
        JSONObject payload = new JSONObject();
        JSONArray waypointArray = new JSONArray();

        List<String> waypointList = sRobot.getLocations();

        // collect all waypoints
        for (String waypoint : waypointList) {
            waypointArray.put(waypoint);
        }

        // generate payload
        payload.put("waypoint_list", waypointArray);
        payload.put("battery_percentage", Objects.requireNonNull(sRobot.getBatteryData()).getBatteryPercentage());

        try {
            MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
            mMqttClient.publish("temi/" + sSerialNumber + "/status/info", message);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * Initializes MQTT client.
     * @param hostUri Host name / URI
     * @param clientId Identifier used to uniquely identify this client
     */
    private void initMqtt(String hostUri, String clientId) {
        Log.i(TAG, "Connecting to MQTT broker");

        mMqttClient = new MqttAndroidClient(getApplicationContext(), hostUri, clientId);
        mMqttClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                // this method is called when connection to server is lost
                Toast.makeText(MainActivity.this, "Connection Lost", Toast.LENGTH_SHORT).show();
                Log.i(TAG, "Connection Lost");
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
                // called when delivery for a message has been completed, and all acknowledgements have been received
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws JSONException {
                // this method is called when a message arrives from the server
                Log.i(TAG, topic);
                Log.i(TAG, message.toString());
                JSONObject payload = new JSONObject(message.toString());
                parseMessage(topic, payload);
            }
        });

        // options that control how the client connects to a server
        // https://www.eclipse.org/paho/files/javadoc/org/eclipse/paho/client/mqttv3/MqttConnectOptions.html
        MqttConnectOptions mqttConnectOptions = new MqttConnectOptions();

        // have the client automatically attempt to reconnect to the server if the connection is lost
        mqttConnectOptions.setAutomaticReconnect(true);

        // client and server should forget the state across reconnects.
        mqttConnectOptions.setCleanSession(true);

        // the maximum time interval the client will wait for the network connection to the MQTT server to be established [seconds]
        mqttConnectOptions.setConnectionTimeout(10);

        // set the "Last Will and Testament" (LWT) for the connection
        JSONObject payload = new JSONObject();
        mqttConnectOptions.setWill("temi/" + sSerialNumber + "/lwt", payload.toString().getBytes(StandardCharsets.UTF_8), 1, false);

        try {
            mMqttClient.connect(mqttConnectOptions, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Toast.makeText(MainActivity.this, "Successfully Connected", Toast.LENGTH_SHORT).show();
                    Log.i(TAG, "Successfully connected to MQTT broker");
                    try {
                        // subscribe to all command-type messages directed at this robot
                        mMqttClient.subscribe("temi/" + sSerialNumber + "/command/#", 0);
                    } catch (MqttException e) {
                        e.printStackTrace();
                    }

                    // start a background task that periodically sends robot status information
                    // to the MQTT broker
                    sHandler.post(periodicTask);
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Toast.makeText(MainActivity.this, "Failed to Connect", Toast.LENGTH_SHORT).show();
                    Log.i(TAG, "Failed to connect to MQTT broker");
                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    /**
     * Parses MQTT messages received by this client.
     * @param topic Message topic
     * @param payload Message payload
     * @throws JSONException
     */
    private void parseMessage(String topic, JSONObject payload) throws JSONException {
        String[] topicTree = topic.split("/");

        String robotID = topicTree[1];
        String type = topicTree[2];
        String category = topicTree[3];

        Log.d(TAG, "Robot-ID: " + robotID);
        Log.d(TAG, "Type: " + type);
        Log.d(TAG, "Category: " + category);

        if (robotID.equals(sSerialNumber)) {
            switch (category) {
                case "waypoint":
                    parseWaypoint(topicTree[4], payload);
                    break;

                case "move":
                    parseMove(topicTree[4], payload);
                    break;

                case "call":
                    startCall();
                    break;

                default:
                    Log.i(TAG, "Invalid topic: " + topic);
                    break;
            }
        }
    }

    /**
     * Parses Waypoint messages.
     * @param command Command type
     * @param payload Message Payload
     * @throws JSONException
     */
    private void parseWaypoint(String command, JSONObject payload) throws JSONException {
        String locationName = payload.getString("location");

        switch (command) {
            case "save":
                sRobot.saveLocation(locationName);
                break;

            case "delete":
                sRobot.deleteLocation(payload.getString(locationName));
                break;

            case "goto":
                // check that the location exists, then go to that location
                for (String location : sRobot.getLocations()){
                    if (location.equals(locationName.toLowerCase().trim())) {
                        sRobot.goTo(locationName.toLowerCase().trim());
                    }
                }
                break;

            default:
                Log.i(TAG, "[WAYPOINT] Unknown Locations Command");
                break;
        }
    }

    /**
     * Parses Move messages.
     * @param command Command type
     * @param payload Message Payload
     * @throws JSONException
     */
    private void parseMove(String command, JSONObject payload) throws JSONException {
        switch (command) {
            case "joystick":
                float x = Float.parseFloat(payload.getString("x"));
                float y = Float.parseFloat(payload.getString("y"));
                sRobot.skidJoy(x, y);
                break;

            case "forward":
                sRobot.skidJoy(+1.0F, 0.0F);
                break;

            case "backward":
                sRobot.skidJoy(-1.0F, 0.0F);
                break;

            case "turn_by":
                sRobot.turnBy(Integer.parseInt(payload.getString("angle")));
                break;

            case "tilt":
                sRobot.tiltAngle(Integer.parseInt(payload.getString("angle")));
                break;

            case "tilt_by":
                sRobot.tiltBy(Integer.parseInt(payload.getString("angle")));
                break;

            case "stop":
                sRobot.stopMovement();
                break;

            default:
                Log.i(TAG, "[MOVE] Unknown Movement Command");
                break;
        }
    }

    private void startCall() {
        Log.v(TAG, "[CMD][CALL]");

        // Build options object for joining the conference. The SDK will merge the default
        // one we set earlier and this one when joining.
        JitsiMeetConferenceOptions options
                = new JitsiMeetConferenceOptions.Builder()
                .setRoom("temi-" + sSerialNumber)
                .build();

        // Launch the new activity with the given options. The launch() method takes care
        // of creating the required Intent and passing the options.
        JitsiMeetActivity.launch(this, options);
    }
}
