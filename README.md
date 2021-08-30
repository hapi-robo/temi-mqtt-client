# temi MQTT Client
An MQTT client for temi, which can be used for prototyping purposes.

This app was designed to be used with [pytemi](https://github.com/hapi-robo/pytemi).


## Prerequisites
You will need an MQTT broker.

Some free, public MQTT brokers that you can use:
- [test.mosquitto.org](test.mosquitto.org)
- [broker.hivemq.com](broker.hivemq.com)

If you want to use a broker locally, one option is:
- [mqtt-broker](https://github.com/hapi-robo/mqtt-broker)

Note that this app is hardcoded to use port 1883 -- it does not use SSL.


## Setup
Add a ``secrets.properties`` file to the root folder with the following content:
```
MQTT_HOSTNAME="<mqtt-broker-hostname>"
MQTT_USERNAME="<mqtt-broker-username>"
MQTT_PASSWORD="<mqtt-broker-password>"
```


## Usage
- Install the app
- Start the app
- Edit the hostname in the provided text-field, if needed
- Tap on the `Connect` button


## Topics
### Publish
Search for `mMqttClient.publish` in MainActivity.java for all published messages. 

In summary:
```
temi/{id}/status/info
temi/{id}/status/utils/battery
temi/{id}/event/user/interaction
temi/{id}/event/user/detection
temi/{id}/event/waypoint/goto

```
where `{id}` is the robot's serial number.


### Subscribe
Search for `mMqttClient.subscribe` and `parseMessage` in MainActivity.java for all subscribed messages. 

In summary:
```
temi/{id}/command/waypoint
temi/{id}/command/move
temi/{id}/command/tts
temi/{id}/command/media
```
where `{id}` is the robot's serial number.
