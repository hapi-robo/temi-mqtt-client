// MQTT broker with websocket support
const MQTT_BROKER_HOST = 'localhost';
// const MQTT_BROKER_HOST = '192.168.0.118';
const MQTT_BROKER_PORT = 9001;

let client;

/*
 * Connect to MQTT broker
 * ref: https://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html
 */
function connectMQTT() {
  console.log(`Connecting to ${MQTT_BROKER_HOST}:${MQTT_BROKER_PORT}`);

  // unique identifier
  const d = new Date();
  const id = `user-${d.getTime()}`;
  client = new Paho.Client(MQTT_BROKER_HOST, MQTT_BROKER_PORT, id);

  // sniff and display messages on MQTT bus
  client.onMessageArrived = onMessageArrived;
  
  const options = {
    // connection attempt timeout in seconds
    timeout: 3,

    // on successful connection
    onSuccess: function() {
      console.log('Success');
      M.toast({
        html: 'Successfully connected to MQTT broker',
        displayLength: 2000,
        classes: 'rounded'
      });
      client.subscribe('temi/+/status/#');
    },

    // on failed connection
    onFailure: function(message) {
      console.error(`Fail: ${message.errorMessage}`);
      M.toast({
        html: 'Failed to connect to MQTT broker',
        displayLength: 3000,
        classes: 'rounded'
      });
    }
  };

  // attempt to connect
  client.connect(options);
}

/*
 * General message callback
 */
function onMessageArrived(message) {
  // console.log('[RECIEVE]');
  // console.log(`Topic: ${message.destinationName}`);
  // console.log(`Payload: ${message.payloadString}`);

  // parse message
  // temi/123/status/locations/goto
  const topicTree = message.destinationName.split("/");
  const robotID = topicTree[1]; // [robot-id]
  const type = topicTree[2]; // [status, command]
  const category = topicTree[3];

  // console.log(`Robot-ID: ${robotID}`);
  // console.log(`Type: ${type}`);
  // console.log(`Category: ${category}`);

  if (robotID == undefined) {
    console.warn("Message from undefined robot received");
  } else {
    if (type == 'status') {
      // parse payload
      switch(category) {
        case 'info':
          updateRobotList(robotID, message.payloadString);
          break;
        case 'locations':
          break;
        case 'utils':
          break;
        default:
          console.warn(`Undefined category: ${category}`);
          break;
      }
    }

  }
}

function updateRobotList(id, payload) {
  let found = robotList.find(e => e.id == id);

  if (found == undefined) {
    console.log("Append");
    // append new robot
    let r = new Robot(id);
    robotList.push(r);
  } else {
    console.log("Update");
    // update robot
    const data = JSON.parse(payload);
    found.id = undefined;
    // found.name = undefined;
    // found.ipAddress = undefined;
    // found.location = undefined;
    // found.state = undefined;
    found.batteryPercentage = data.battery_percentage;
    found.waypointList.length = 0; // clear array
    for (waypoint of data.waypoint_list) {
      // console.log(waypoint)
      found.waypointList.push(waypoint);
    }
    // console.log(`Number of Locations: ${data.waypoint_list.length}`);
  }
  // console.log(`Number of Robots: ${robotList.length}`);
}
