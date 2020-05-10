const gamepadSocket = io();

let gamepadInterval;

function setDeadzone(val) {
  // anything smaller is set to 0
  const DEADZONE = 0.05; // @TODO Let user configure this

  let newVal = val;
  if (Math.abs(val) < DEADZONE) {
    // if within the dead zone, set to 0
    newVal = 0;
  } else {
    // if outside the dead zone, remap to smooth out value
    newVal = val - Math.sign(val) * DEADZONE;
    newVal /= 1.0 - DEADZONE;
  }

  return newVal;
}

function gamepadLoop() {
  const gamepads = navigator.getGamepads();

  if (!gamepads) {
    return;
  }

  const gp = gamepads[0];
  const data = {
    translate: setDeadzone(gp.axes[0]),
    rotate: setDeadzone(gp.axes[1]),
    tilt: gp.buttons[6].value
  };

  gamepadSocket.emit("gamepad", JSON.stringify(data));
}

window.addEventListener("gamepadconnected", e => {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index,
    e.gamepad.id,
    e.gamepad.buttons.length,
    e.gamepad.axes.length
  );

  // start gamepad loop
  gamepadInterval = setInterval(gamepadLoop, 100);
});

window.addEventListener("gamepaddisconnected", e => {
  console.log(
    "Gamepad disconnected from index %d: %s",
    e.gamepad.index,
    e.gamepad.id
  );

  // stop gamepad loop
  clearInterval(gamepadInterval);
});
