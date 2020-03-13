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
  const topic_tree = message.destinationName.split("/");
  const robot_id = topic_tree[1]; // [robot-id]
  const type = topic_tree[2]; // [status, command]
  const category = topic_tree[3];

  // console.log(`Robot-ID: ${robot_id}`);
  // console.log(`Type: ${type}`);
  // console.log(`Category: ${category}`);

  if (robot_id == undefined) {
    console.warn("Message from undefined robot received");
  } else {
    if (type == 'status') {
      // parse payload
      switch(category) {
        case 'info':
          updateRobotList(robot_id, message.payloadString);
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

function updateRobotNav(e) {
  let robotNav = document.getElementById('robot-nav');

  // clear list
  robotNav.textContent = '';

  // populate list
  for (robot of robotList) {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.id = robot.id;
    a.className = "sidenav-close white-text waves-effect";

    let i = document.createElement('i');
    i.className = "material-icons white-text";
    let iconName = document.createTextNode("link");

    let text = document.createTextNode(robot.id);

    i.append(iconName);
    a.appendChild(i);
    a.appendChild(text);
    li.appendChild(a);

    robotNav.insertBefore(li, robotNav.firstChild);
  }

  // hide robot-nav-btn
  document.getElementById('robot-nav-btn').style = "display:none";
}

function showRobotNavBtn() {
  document.getElementById('robot-nav-btn').style = "display:block";
}

function updateWaypointNav(e) {
  let waypointNav = document.getElementById('waypoint-nav');

  // clear list
  waypointNav.textContent = '';

  if (selectedRobot == undefined) {
    console.warn("Robot not selected");
  } else {
    // console.log(selectedRobot.id);
    for (waypoint of selectedRobot.waypointList) {
      // console.log(waypoint);
      let li = document.createElement('li');
      let a = document.createElement('a');
      a.id = waypoint;
      a.className = "sidenav-close white-text waves-effect";

      let text = document.createTextNode(waypoint);

      a.appendChild(text);
      li.appendChild(a);

      waypointNav.insertBefore(li, waypointNav.firstChild);
    }

    // hide robot-nav-btn
    document.getElementById('robot-menu').style = "display:none";
  }
}

function showWaypointNavBtn() {
  document.getElementById('robot-menu').style = "display:block";
}

function updateBatteryState(value) {
  let batteryState = document.getElementById('battery-state');

  // @TODO "far fa-battery-bolt"

  if (value >= 87.5) {
    batteryState.className = "fas fa-battery-full";
  } else if (value >= 62.5 && value < 87.5) {
    batteryState.className = "fas fa-battery-three-quarters";
  } else if (value >= 37.5 && value < 62.5) {
    batteryState.className = "fas fa-battery-half";
  } else if (value >= 12.5 && value < 37.5) {
    batteryState.className = "fas fa-battery-quarter";
  } else if (value >= 0 && value < 12.5) {
    batteryState.className = "fas fa-battery-empty";
    batteryState.style = "color:red";
  } else {
    console.warn(`Battery value: ${value}`);
  }
}