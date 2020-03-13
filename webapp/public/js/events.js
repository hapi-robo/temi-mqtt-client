document.addEventListener('DOMContentLoaded', function() {
  const elems = document.querySelector('#robot-nav');
  const instances = M.Sidenav.init(elems, {
    edge: 'left',
    onOpenStart: updateRobotNav,
    onCloseStart: showRobotNavBtn
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const elems = document.querySelector('#waypoint-nav');
  const instances = M.Sidenav.init(elems, {
    edge: 'right',
    onOpenStart: updateWaypointNav,
    onCloseStart: showWaypointNavBtn
  });
});

document.getElementById('robot-nav').addEventListener('click', selectRobot);
document.getElementById('waypoint-nav').addEventListener('click', selectWaypoint);
// document.getElementById('video-conference').addEventListener('mousemove', mouseEvent);
document.addEventListener('keydown', keyboardEvent);

function mouseEvent(e) {
  console.log(`x: ${e.offsetX} | y: ${e.offsetY}`);
}

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