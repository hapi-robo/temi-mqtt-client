# temi MQTT Client
An MQTT client for temi, which can be used for prototyping.

Note that this app is hardcoded to use port 1883 -- it does not use SSL.


## Setup
Add a ``secrets.properties`` file to the root folder with the following content:
```
MQTT_HOSTNAME="<mqtt-hostname>"
MQTT_USERNAME="<mqtt-username>"
MQTT_PASSWORD="<mqtt-password>"
```


## Usage
- Start the app on temi.
- Edit the hostname in the provided text-field if needed
- Tap on `Connect`


## MQTT Brokers
Some free, public MQTT brokers that you can use:
- [test.mosquitto.org](test.mosquitto.org)
- [broker.hivemq.com](broker.hivemq.com)

If you want to use a broker locally, one option is:
- [mqtt-broker](https://github.com/hapi-robo/mqtt-broker)


## MQTT Client
This app was designed to be used with this Python package for prototyping purposes:
- [pytemi](https://github.com/hapi-robo/pytemi)


## Topics
### Publish
Search for `mMqttClient.publish` in MainActivity.java for all published messages. In summary:
```
temi/{serialNumber}/status/info
temi/{serialNumber}/status/utils/battery
temi/{serialNumber}/event/user/interaction
temi/{serialNumber}/event/user/detection
temi/{serialNumber}/event/waypoint/goto

```

where `{serialNumber}` is the robot's serial number.

### Subscribe
Search for `mMqttClient.subscribe` and `parseMessage` in MainActivity.java for all subscribed messages. In summary:
```
temi/{serialNumber}/command/waypoint
temi/{serialNumber}/command/move
temi/{serialNumber}/command/tts
temi/{serialNumber}/command/media
```
