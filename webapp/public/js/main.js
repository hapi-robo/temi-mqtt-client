// import { Robot } from './robot.js';
// import { VideoConference } from './videoConference.js';

// global variables
let selectedRobot;
let robotList = new Array();
let vidCon = new VideoConference();
let client

window.onload = connectMQTT('localhost', 9001);

document.addEventListener('DOMContentLoaded', showRobotNav);
document.addEventListener('DOMContentLoaded', showWaypointNav);
document.addEventListener('keydown', keyboardEvent);

document.querySelector('#robot-nav').addEventListener('click', selectRobot);
document.querySelector('#waypoint-nav').addEventListener('click', selectWaypoint);
// document.querySelector('#video-conference').addEventListener('mousemove', mouseEvent);


// DOCUMENT EVENT HANDLERS
function showRobotNav() {
  const elems = document.querySelector('#robot-nav');
  const instances = M.Sidenav.init(elems, {
    edge: 'left',
    onOpenStart: updateRobotNav,
    onCloseStart: showRobotNavBtn
  });
}

function showRobotNavBtn() {
  document.getElementById('robot-nav-btn').style = "display:block";
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

function showWaypointNav() {
  const elems = document.querySelector('#waypoint-nav');
  const instances = M.Sidenav.init(elems, {
    edge: 'right',
    onOpenStart: updateWaypointNav,
    onCloseStart: showWaypointNavBtn
  });
}

function showWaypointNavBtn() {
  document.getElementById('robot-menu').style = "display:block";
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

// https://keycode.info/
function keyboardEvent(e) {
  if (selectedRobot == undefined) {
    console.warn("No robot selected");
  } else {
    switch (e.keyCode) {
      case 37: // ArrowLeft
      case 65: // a
        console.log('[Keycode] ArrowLeft / a');
        selectedRobot.cmdTurnLeft();
        break;

      case 39: // ArrowRight
      case 68: // d
        console.log('[Keycode] ArrowRight / d');
        selectedRobot.cmdTurnRight();
        break;

      case 38: // ArrowUp
      case 87: // w
        console.log('[Keycode] ArrowUp / w');
        selectedRobot.cmdMoveFwd();
        break;

      case 40: // ArrowDown
      case 83: // s
        console.log('[Keycode] ArrowDown / s');
        selectedRobot.cmdMoveBwd();
        break;

      case 85: // u
        console.log('[Keycode] u');
        selectedRobot.cmdTiltUp();
        break;

      case 74: // j
        console.log('[Keycode] j');
        selectedRobot.cmdTiltDown();
        break;
    }

    if (e.ctrlKey) {
      switch (e.keyCode) {
        case 70: // CTRL + f
          console.log('[Keycode] CTRL + f');
          selectedRobot.cmdFollow();
          break;
      }
    } 
  }
}


// CLICK EVENT HANDLERS

function selectRobot(e) {
  // console.log(`Selected Robot: ${e.target.id}`);
  selection = robotList.find(r => r.id == e.target.id);

  // check that the selection is valid
  if (selection != undefined) {
    if (selectedRobot == undefined) { // no robot in use
      // start new video conference
      vidCon.open(selection.id);
    } else { // robot is currently in use
      if (e.target.id != selectedRobot.id) {
        // close video conference
        vidCon.close();
      }

      // start new video conference
      vidCon.open(selection.id);
    }

    // assign robot selection
    selectedRobot = selection;

    // update battery state
    updateBatteryState(selectedRobot.batteryPercentage);

    // hide robot-nav-btn
    document.getElementById('robot-nav-btn').style = "display:none";

    // show robot menu
    document.getElementById('robot-menu').style = "display:block";
  }
}

function selectWaypoint(e) {
  selectedRobot.cmdGoto(e.target.id);
  console.log(`Selected Destination: ${selectedRobot.destination}`);
}

function mouseEvent(e) {
  console.log(`x: ${e.offsetX} | y: ${e.offsetY}`);
}


// HELPER FUNCTIONS

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

/*
 * Connect to MQTT broker
 * ref: https://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html
 */
function connectMQTT(host, port) {
  console.log(`Connecting to ${host}:${port}`);

  // unique identifier
  const d = new Date();
  const id = `user-${d.getTime()}`;
  client = new Paho.Client(host, port, id);

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
  console.log('[RECIEVE]');
  console.log(`Topic: ${message.destinationName}`);
  console.log(`Payload: ${message.payloadString}`);

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
    let r = new Robot(id, client);
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
