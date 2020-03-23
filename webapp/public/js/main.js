import { Robot } from './modules/robot.js';
import { VideoConference } from './modules/videoConference.js';

// global variables
const robotList = [];
const videoCall = new VideoConference();
let selectedRobot;
let client;


// DOCUMENT EVENT HANDLERS
function updateRobotCollection() {
  const robotCollection = document.querySelector('#robot-collection');
  robotCollection.className = 'collection';

  // clear list
  robotCollection.textContent = '';

  // populate list
  robotList.forEach((robot) => {
    const a = document.createElement('a');
    a.id = robot.id;
    a.className = 'collection-item black white-text waves-effect center-align';
    const text = document.createTextNode(robot.id);
    a.append(text);

    robotCollection.insertBefore(a, robotCollection.firstChild);
  });
}

// mobile-only
function updateWaypointCollection() {
  const waypointCollection = document.querySelector('#waypoint-collection');
  waypointCollection.className = 'collection';

  // clear list
  waypointCollection.textContent = '';

  if (selectedRobot === undefined) {
    console.warn('Robot not selected');
  } else {
    // populate list
    selectedRobot.waypointList.forEach((waypoint) => {
      const a = document.createElement('a');
      a.id = waypoint;
      a.className = 'collection-item black white-text waves-effect center-align';
      const text = document.createTextNode(waypoint);
      a.appendChild(text);
      waypointCollection.insertBefore(a, waypointCollection.firstChild);
    });
  }
}

// desktop-only
function updateWaypointModal() {
  const waypointNav = document.querySelector('#waypoint-modal');

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
    onOpenStart: updateWaypointModal,
  });
}

function showRobotMenu() {
  console.log('Show Robot Menu');

  // show robot menu
  document.querySelector('#robot-menu').style.height = '80vh';
  document.querySelector('#robot-menu').style.display = 'block';

  // hide other menus
  document.querySelector('#robot-ctrl-panel').style.display = 'none';
}

function showWaypointMenu() {
  console.log('Show Waypoint Menu');

  // show waypoint menu
  document.querySelector('#waypoint-menu').style.display = 'block';
  updateWaypointCollection();

  // hide other menus
  document.querySelector('#robot-menu').style.display = 'none';
}

function showCtrlPanel() {
  console.log('Show Control Panel');

  // show control panel
  document.querySelector('#robot-ctrl-panel').style.display = 'block';
  document.querySelector('#video-btn').className = 'btn-flat white-text';

  // hide other menus
  document.querySelector('#robot-menu').style.display = 'none';
}

// https://keycode.info/
function keyboardEvent(e) {
  if (selectedRobot === undefined) {
    const id = document.querySelector('#temi-id').value;
    const selection = robotList.find((r) => r.id === id);

    switch (e.keyCode) {
      case 13: // Enter
        console.log('[Keycode] Enter');
        console.log(`Robot-ID: ${id}`);

        // check that the selection is valid
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

function startVideoCall() {
  document.querySelector('#video-btn').className = 'btn-flat disabled';

  // start new video conference
  console.log('Starting Video Conference...');
  selectedRobot.cmdCall(); // start the call on the robot's side
  videoCall.open(selectedRobot.id);
  // TODO: This needs to be cleaned up
  videoCall.handle.on('readyToClose', () => {
    console.log('Closing Video Conference...');
    videoCall.handle.dispose();
    // videoCall.handle.close();
    // TODO: end call on the robot's side; how to know if other users aren't using the robot?
    showRobotMenu();
  });
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

    // show waypoint menu
    // showWaypointMenu(); // mobile
    showCtrlPanel(); // desktop

    // update battery state
    updateBatteryState(selection.batteryPercentage);
  }
}

function selectWaypoint(e) {
  selectedRobot.cmdGoto(e.target.id);
  console.log(`Selected Destination: ${selectedRobot.destination}`);
}

function updateRobotList(id, payload) {
  const index = robotList.findIndex((e) => e.id === id);

  if (index === -1) {
    console.log('Append');
    robotList.push(new Robot(id, client));

    const data = JSON.parse(payload);
    robotList[robotList.length - 1].waypointList = data.waypoint_list;
    robotList[robotList.length - 1].batteryPercentage = data.battery_percentage;
  } else {
    console.log('Update');

    const data = JSON.parse(payload);
    robotList[index].waypointList.length = 0; // clear array
    robotList[index].waypointList = data.waypoint_list;
    robotList[index].batteryPercentage = data.battery_percentage;
  }
  // console.log(`Number of Robots: ${robotList.length}`);
}

/*
 * General message callback
 */
function onMessageArrived(message) {
  console.log('[RECIEVE]');
  console.log(`Topic: ${message.destinationName}`);
  console.log(`Payload: ${message.payloadString}`);

  // parse message
  const topicTree = message.destinationName.split('/');
  const robotID = topicTree[1]; // [robot-id]
  const type = topicTree[2]; // [status, command]
  const category = topicTree[3];

  console.log(`Robot-ID: ${robotID}`);
  console.log(`Type: ${type}`);
  console.log(`Category: ${category}`);

  if (robotID === undefined) {
    console.warn('Message from undefined robot received');
  } else {
    switch (type) {
      case 'status':
        // parse payload
        switch (category) {
          case 'info': {
            updateRobotList(robotID, message.payloadString);
            updateRobotCollection();
            // updateWaypointCollection(); // mobile-only
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
        break;

      case 'command':
        break;

      default:
        break;
    }
  }
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    M.toast({
      html: 'Connection Lost',
      displayLength: 2000,
      classes: 'rounded',
    });
    console.log(`onConnectionLost: ${responseObject.errorMessage}`);
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
  client.onConnectionLost = onConnectionLost;

  const options = {
    timeout: 3,
    reconnect: false,
    onSuccess: () => {
      console.log('Successfully connected to MQTT broker');
      M.toast({
        html: 'Successfully Connected',
        displayLength: 2000,
        classes: 'rounded',
      });
      client.subscribe('temi/+/status/#');
    },
    onFailure: (message) => {
      console.error(`Fail: ${message.errorMessage}`);
      M.toast({
        html: 'Failed to Connect',
        displayLength: 3000,
        classes: 'rounded',
      });
    },
  };

  // attempt to connect
  client.connect(options);
}

document.body.style.backgroundColor = 'black';

// @TODO Make this configurable
// window.onload = connectMQTT('localhost', 9001);
window.onload = connectMQTT('192.168.0.177', 9001);
window.onload = showRobotMenu();

document.addEventListener('DOMContentLoaded', showWaypointNav);
document.addEventListener('keydown', keyboardEvent);

document.querySelector('#robot-collection').addEventListener('click', selectRobot);
document.querySelector('#video-btn').addEventListener('click', startVideoCall);
document.querySelector('#waypoint-modal').addEventListener('click', selectWaypoint); // desktop-on
document.querySelector('#waypoint-collection').addEventListener('click', selectWaypoint); // mobile-only
