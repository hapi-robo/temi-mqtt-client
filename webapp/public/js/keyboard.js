const keyboardSocket = io();

// https://keycode.info/
function keyboardEvent(event) {
  const serial = sessionStorage.getItem("selectedSerialNumber");

  switch (event.keyCode) {
    case 37: // ArrowLeft
    case 65: // a
      // console.log("[Keycode] ArrowLeft / a");
      keyboardSocket.emit("keyboard", { serial: serial, rotate: +1 });
      break;

    case 39: // ArrowRight
    case 68: // d
      // console.log("[Keycode] ArrowRight / d");
      keyboardSocket.emit("keyboard", { serial: serial, rotate: -1 });
      break;

    case 38: // ArrowUp
    case 87: // w
      // console.log("[Keycode] ArrowUp / w");
      keyboardSocket.emit("keyboard", { serial: serial, translate: +1 });
      break;

    case 40: // ArrowDown
    case 83: // s
      // console.log("[Keycode] ArrowDown / s");
      keyboardSocket.emit("keyboard", { serial: serial, translate: -1 });
      break;

    case 85: // =
      // console.log("[Keycode] u");
      keyboardSocket.emit("keyboard", { serial: serial, tilt: +1 });
      break;

    case 74: // -
      // console.log("[Keycode] j");
      keyboardSocket.emit("keyboard", { serial: serial, tilt: -1 });
      break;

    case 13: // Enter
      // console.log("[Keycode] Enter");
      break;

    default:
      break;
  }

  // CTRL + ...
  if (event.ctrlKey) {
    switch (event.keyCode) {
      case 70: // f
        // console.log("[Keycode] CTRL + f");
        break;

      default:
        break;
    }
  }
}

document.addEventListener("keydown", keyboardEvent);
