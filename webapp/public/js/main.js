import { Robot } from './modules/robot.js';
import { VideoConference } from './modules/videoConference.js';

// global variables
let selectedRobot;
const robotList = [];
const vidCon = new VideoConference();
let client;


// DOCUMENT EVENT HANDLERS
function updateRobotCollection() {
  const robotNav = document.querySelector('#robot-collection');
  robotNav.className = 'collection';

  // clear list
  robotNav.textContent = '';

  // populate list
  robotList.forEach((robot) => {
    const a = document.createElement('a');
    a.id = robot.id;
    a.className = 'collection-item black white-text waves-effect center-align';
    const text = document.createTextNode(robot.id);
    a.append(text);

    robotNav.insertBefore(a, robotNav.firstChild);
  });
}

function updateWaypointNav() {
  const waypointNav = document.querySelector('#waypoint-nav');

  // clear list
  waypointNav.textContent = '';

  if (selectedRobot === undefined) {
    console.warn('Robot not selected');
  } else {
    console.log(selectedRobot.id);
    selectedRobot.waypointList.forEach((waypoint) => {
      console.log(waypoint);
      const a = document.createElement('a');
      a.id = waypoint;
      a.className = 'collection-item center-align waves-effect';
      const text = document.createTextNode(waypoint);

      a.appendChild(text);

      waypointNav.insertBefore(a, waypointNav.firstChild);
    });
  }
}

function showWaypointNav() {
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems, {
    onOpenStart: updateWaypointNav
  });

}

// https://keycode.info/
function keyboardEvent(e) {
  if (selectedRobot === undefined) {
    switch(e.keyCode) {
      case 13: // Enter
        console.log('[Keycode] Enter');
        const id = document.querySelector('#temi_id').value;
        console.log(`Robot-ID: ${id}`);

        // check that the selection is valid
        const selection = robotList.find((r) => r.id === id);
        if (selection === undefined) {
          M.toast({
              html: 'Invalid ID',
              displayLength: 2000,
              classes: 'rounded',
            });
        }

        break;

      default:
        console.warn('No robot selected');
        break;
    }
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

      default:
        break;
    }

    if (e.ctrlKey) {
      switch (e.keyCode) {
        case 70: // CTRL + f
          console.log('[Keycode] CTRL + f');
          selectedRobot.cmdFollow();
          break;

        default:
          break;
      }
    }
  }
}

function updateBatteryState(value) {
  const batteryState = document.querySelector('#battery-state');

  // @TODO "far fa-battery-bolt"

  if (value >= 87.5) {
    batteryState.className = 'fas fa-battery-full';
  } else if (value >= 62.5 && value < 87.5) {
    batteryState.className = 'fas fa-battery-threequarters';
  } else if (value >= 37.5 && value < 62.5) {
    batteryState.className = 'fas fa-battery-half';
  } else if (value >= 12.5 && value < 37.5) {
    batteryState.className = 'fas fa-battery-quarter';
  } else if (value >= 0 && value < 12.5) {
    batteryState.className = 'fas fa-battery-empty';
    batteryState.style = 'color:red';
  } else {
    console.warn(`Battery value: ${value}`);
  }
}

function startVidCon() {
  document.querySelector('#video-btn').style.display = 'none';

  // start new video conference
  console.log("Starting Video Conference...");  
  selectedRobot.cmdCall(); // start the call on the robot's side
  vidCon.open(selectedRobot.id);
}

function selectRobot(e) {
  console.log(`Selected Robot: ${e.target.id}`);
  
  // check that the selection is valid
  const selection = robotList.find((r) => r.id === e.target.id);
  if (selection === undefined) {
    M.toast({
        html: 'Invalid ID',
        displayLength: 2000,
        classes: 'rounded',
      });
  } else {
    // assign selected robot
    selectedRobot = selection;

    // hide robot-menu
    document.querySelector('#robot-menu').style.display = 'none';

    // show robot control panel
    document.querySelector('#robot-ctrl-panel').style.display = 'block';

    // update battery state
    updateBatteryState(selection.batteryPercentage);
  }
}

function selectWaypoint(e) {
  selectedRobot.cmdGoto(e.target.id);
  console.log(`Selected Destination: ${selectedRobot.destination}`);
}

// https://stackoverflow.com/questions/17106665/the-mouseevent-offsetx-i-am-getting-is-much-larger-than-actual-canvas-size
function mouseEvent(e) {
  console.log(`x: ${e.offsetX} | y: ${e.offsetY}`);

  const posX = e.offsetX;
  const posY = e.offsetY;

}

function updateRobotList(id, payload) {
  const found = robotList.find((e) => e.id === id);

  if (found === undefined) {
    console.log('Append');
    robotList.push(new Robot(id, client));
  } else {
    console.log('Update');
    const index = robotList.findIndex((e) => e.id === id);
    const data = JSON.parse(payload);
    robotList[index].batteryPercentage = data.battery_percentage;
    robotList[index].waypointList.length = 0; // clear array
    robotList[index].waypointList = data.waypoint_list;
  }
  // console.log(`Number of Robots: ${robotList.length}`);
}

/*
 * General message callback
 */
function onMessageArrived(message) {
  // console.log('[RECIEVE]');
  // console.log(`Topic: ${message.destinationName}`);
  // console.log(`Payload: ${message.payloadString}`);

  // parse message
  const topicTree = message.destinationName.split('/');
  const robotID = topicTree[1]; // [robot-id]
  const type = topicTree[2]; // [status, command]
  const category = topicTree[3];

  // console.log(`Robot-ID: ${robotID}`);
  // console.log(`Type: ${type}`);
  // console.log(`Category: ${category}`);

  if (robotID === undefined) {
    console.warn('Message from undefined robot received');
  } else {
    if (type === 'status') {
      // parse payload
      switch (category) {
        case 'info': {
          updateRobotList(robotID, message.payloadString);
          updateRobotCollection();
          break;
        }
        case 'locations': {
          break;
        }
        case 'utils': {
          break;
        }
        default: {
          console.warn(`Undefined category: ${category}`);
          break;
        }
      }
    }
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
    onSuccess: () => {
      console.log('Success');
      M.toast({
        html: 'Successfully connected to MQTT broker',
        displayLength: 2000,
        classes: 'rounded',
      });
      client.subscribe('temi/+/status/#');
    },

    // on failed connection
    onFailure: (message) => {
      console.error(`Fail: ${message.errorMessage}`);
      M.toast({
        html: 'Failed to connect to MQTT broker',
        displayLength: 3000,
        classes: 'rounded',
      });
    },
  };

  // attempt to connect
  client.connect(options);
}

// @TODO Make this configurable
// window.onload = connectMQTT('localhost', 9001);
window.onload = connectMQTT('192.168.0.177', 9001);

document.body.style.backgroundColor = 'black';

document.addEventListener('DOMContentLoaded', showWaypointNav);
document.addEventListener('keydown', keyboardEvent);

document.querySelector('#robot-collection').addEventListener('click', selectRobot);
document.querySelector('#waypoint-nav').addEventListener('click', selectWaypoint);
document.querySelector('#video-btn').addEventListener('click', startVidCon);
// document.querySelector('#video-conference').addEventListener('mousemove', mouseEvent);
