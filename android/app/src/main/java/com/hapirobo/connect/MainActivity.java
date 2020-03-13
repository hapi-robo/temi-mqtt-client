package com.hapirobo.connect;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.robotemi.sdk.BatteryData;
import com.robotemi.sdk.Robot;
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
        OnGoToLocationStatusChangedListener {

    private static final String TAG = "MQTT";

    private Robot robot;
    private String serialNumber;
    private MqttAndroidClient mqttClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // initialize MQTT
        initMQTT("tcp://192.168.0.118:1883", "temi-android");

        // initialize robot
        robot = Robot.getInstance();

        // initialize default options for Jitsi Meet conferences.
        URL serverURL;
        try {
            serverURL = new URL("https://meet.jit.si");
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new RuntimeException("Invalid server URL!");
        }
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
        robot.addOnRobotReadyListener(this);
        robot.addOnBatteryStatusChangedListener(this);
        robot.addOnGoToLocationStatusChangedListener(this);
    }

    @Override
    protected void onStop() {
        super.onStop();

        robot.removeOnRobotReadyListener(this);
        robot.removeOnBatteryStatusChangedListener(this);
        robot.removeOnGoToLocationStatusChangedListener(this);
    }

    public void onButtonClick(View v) {
        String text = "temi-" + serialNumber;

        if (text.length() > 0) {
            // Build options object for joining the conference. The SDK will merge the default
            // one we set earlier and this one when joining.
            JitsiMeetConferenceOptions options
                = new JitsiMeetConferenceOptions.Builder()
                    .setRoom(text)
                    .build();
            // Launch the new activity with the given options. The launch() method takes care
            // of creating the required Intent and passing the options.
            JitsiMeetActivity.launch(this, options);
        }
    }

    private void initMQTT(String hostURI, String clientID) {
        mqttClient = new MqttAndroidClient(getApplicationContext(), hostURI, clientID);
        mqttClient.setCallback(new MqttCallback() {
            @Override
            public void connectionLost(Throwable cause) {
                Log.v(TAG, "Connection lost");
                // this method is called when connection to server is lost
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken token) {
                // called when delivery for a message has been completed, and all acknowledgements have been received
                Log.v(TAG, "Delivery complete");
            }

            @Override
            public void messageArrived(String topic, MqttMessage message) throws JSONException {
                // this method is called when a message arrives from the server
                Log.v(TAG, topic);
                Log.v(TAG, message.toString());
                JSONObject payload = new JSONObject(message.toString());
                parseMessage(topic, payload);
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
                        mqttClient.subscribe("temi/+/command/#", 0);
                    } catch (MqttException e) {
                        e.printStackTrace();
                    }

                    try {
                        robotPublishStatus();
                    } catch (JSONException e) {
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

    @Override
    public void onRobotReady(boolean isReady) {
        if (isReady) {
            serialNumber = robot.getSerialNumber();
            robot.hideTopBar();
            Log.v(TAG, "[ROBOT][READY]");
        }
    }

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
            MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
            mqttClient.publish("temi/" + serialNumber + "/status/utils/battery", message);
            Log.v(TAG, "[STATUS][BATTERY] " + batteryData.getBatteryPercentage() + "% | " + batteryData.isCharging());
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

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
            Log.v(TAG, "[STATUS][GOTO] Location: " + location + " | Status: " + status);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    private void parseMessage(String topic, JSONObject payload) throws JSONException {
        String[] topicTree = topic.split("/");
        if (topicTree.length <= 4) {
            Log.d(TAG, "Invalid topic: " + topic);
        }

        String robotID = topicTree[1];
        String type = topicTree[2];
        String category = topicTree[3];
        String command = topicTree[4];

        Log.d(TAG, "Robot-ID: " + robotID);
        Log.d(TAG, "Type: " + type);
        Log.d(TAG, "Category: " + category);
        Log.d(TAG, "Command: " + command);

        if (robotID.equals(serialNumber)) {

            switch (category) {
                case "waypoint":
                    parseWaypoint(command, payload);
                    break;
                case "move":
                    parseMove(command, payload);
                    break;
                case "info":
                    try {
                        robotPublishStatus();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    break;
                default:
                    Log.d(TAG, "Invalid topic: " + topic);
                    break;
            }
        } else {
            Log.d(TAG, "This Robot-ID: " + serialNumber);
        }
    }

    private void parseWaypoint(String command, JSONObject payload) throws JSONException {
        String location_name = payload.getString("location");
        Log.v(TAG, "[CMD][WAYPOINT] " + command + " | " + location_name);

        switch (command) {
            case "save":
                robot.saveLocation(location_name);
                break;
            case "delete":
                robot.deleteLocation(payload.getString(location_name));
                break;
            case "get":
                // TBD
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
                Log.v(TAG, "[WAYPOINT] Unknown Locations Command");
                break;
        }
    }

    private void parseMove(String command, JSONObject payload) throws JSONException {
        Log.v(TAG, "[CMD][MOVE] " + command);

        switch (command) {
            case "joystick":
                float x = Float.parseFloat(payload.getString("x"));
                float y = Float.parseFloat(payload.getString("y"));
                robot.skidJoy(x, y);
                break;
            case "forward":
                robot.skidJoy(+1.0F, 0.0F);
                break;
            case "backward":
                robot.skidJoy(-1.0F, 0.0F);
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
                Log.v(TAG, "[MOVE] Unknown Movement Command");
                break;
        }
    }

    private void robotPublishStatus() throws JSONException {
        JSONObject payload = new JSONObject();
        JSONArray waypointArray = new JSONArray();

        List<String> waypointList = robot.getLocations();

        // collect all waypoints
        for (String waypoint : waypointList) {
            waypointArray.put(waypoint);
            Log.v(TAG, waypoint);
        }

        // generate payload
        payload.put("waypoint_list", waypointArray);
        payload.put("battery_percentage", Objects.requireNonNull(robot.getBatteryData()).getBatteryPercentage());

        try {
            MqttMessage message = new MqttMessage(payload.toString().getBytes(StandardCharsets.UTF_8));
            mqttClient.publish("temi/" + serialNumber + "/status/info", message);
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }
}
