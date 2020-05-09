const gamepadSocket = io();

let gamepadInterval;

window.addEventListener("gamepadconnected", (event) => {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    event.gamepad.index,
    event.gamepad.id,
    event.gamepad.buttons.length,
    event.gamepad.axes.length
  );

  // start gamepad loop
  gamepadInterval = setInterval(gamepadLoop, 100);
});

window.addEventListener("gamepaddisconnected", (event) => {
  consolevent.log(
    "Gamepad disconnected from index %d: %s",
    event.gamepad.index,
    event.gamepad.id
  );

  // stop gamepad loop
  clearInterval(gamepadInterval);
});

function setDeadzone(val) {
  // anything smaller is set to 0
  const DEADZONE = 0.05; // @TODO Let user configure this

  if (Math.abs(val) < DEADZONE) {
    // if within the dead zone, set to 0
    val = 0;
  } else {
    // if outside the dead zone, remap to smooth out value
    val = val - Math.sign(val) * DEADZONE;
    val /= 1.0 - DEADZONE;
  }

  return val;
}

function gamepadLoop() {
  const gamepads = navigator.getGamepads
    ? navigator.getGamepads()
    : navigator.webkitGetGamepads
    ? navigator.webkitGetGamepads
    : [];
  if (!gamepads) {
    return;
  }

  var gp = gamepads[0];

  const data = JSON.stringify({
    translate: setDeadzone(gp.axes[0]),
    rotate: setDeadzone(gp.axes[1]),
    tilt: gp.buttons[6].value,
  });

  gamepadSocket.emit("gamepad", data);
}
