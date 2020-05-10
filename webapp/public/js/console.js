import { cmdGoto } from "./modules/commands.js";

function showSelectWaypointElement(waypointList) {
  const inputGoto = document.querySelector("#input-goto");

  inputGoto.innerHTML = ""; // reset content

  const div = document.createElement("div");
  div.className = "input-group";
  div.innerHTML = `<div class="input-group-prepend">
                  <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                </div>
                <select class="custom-select" id="select-goto"></select>
                <div class="input-group-append">
                  <button class="btn btn-secondary" type="button" id="btn-goto">Go</button>
                </div>`;
  inputGoto.appendChild(div);
  inputGoto.querySelector("#btn-goto").addEventListener("click", cmdGoto);

  const selectGoto = inputGoto.querySelector("#select-goto");

  // construct waypoint list
  const instructionOption = document.createElement("option");
  instructionOption.id = "option-instruction";
  instructionOption.disabled = true;
  instructionOption.selected = true;
  instructionOption.style.display = "none";
  instructionOption.textContent = "Choose Location...";
  selectGoto.appendChild(instructionOption);

  waypointList.forEach(waypointName => {
    const option = document.createElement("option");
    option.id = `option-${waypointName}`;
    option.value = waypointName;
    option.textContent = waypointName;
    selectGoto.appendChild(option);
  });
}

function showBatteryState(value) {
  // @TODO "far fa-battery-bolt"
  const i = document.createElement("i");

  if (value >= 87.5) {
    i.className = "fas fa-battery-full";
  } else if (value >= 62.5 && value < 87.5) {
    i.className = "fas fa-battery-threequarters";
  } else if (value >= 37.5 && value < 62.5) {
    i.className = "fas fa-battery-half";
  } else if (value >= 12.5 && value < 37.5) {
    i.className = "fas fa-battery-quarter";
  } else if (value >= 0 && value < 12.5) {
    i.className = "fas fa-battery-empty";
    i.style.color = "red";
  }

  const deviceBattery = document.querySelector("#device-battery");
  deviceBattery.appendChild(i);
}

async function showDeviceConsole(serial) {
  // get device information
  const res = await fetch(`/devices/info?serial=${serial}`, { method: "GET" });
  const dev = await res.json();
  console.log(dev);

  // reset values
  document.querySelector("#device-serial").innerHTML = serial;
  document.querySelector("#device-battery").innerHTML = "";

  // show device details
  if (dev.success === false) {
    document.querySelector("#device-status").innerHTML = "Offline";
    document.querySelector("#btn-video").style.dispay = "none";
    document.querySelector("#input-goto").innerHTML = "";
  } else {
    document.querySelector("#device-status").innerHTML = "Online";

    // show battery status
    if (typeof dev.batteryPercentage === "undefined") {
      document.querySelector("#device-battery").innerHTML = "Unknown";
    } else {
      showBatteryState(dev.batteryPercentage);
    }

    // show goto list
    if (dev.waypointList.length > 0) {
      showSelectWaypointElement(dev.waypointList);
    }

    // show video button
    document.querySelector("#btn-video").style.display = "block";
  }
}

function onDeviceClick(e) {
  const serial = e.target.id;
  sessionStorage.setItem("selectedSerial", serial);

  // show device details
  document.querySelector("#div-device-details").style.display = "block";
  showDeviceConsole(this.id);
}

async function showDeviceList() {
  const res = await fetch("/devices/get", { method: "GET" });
  const data = await res.json();

  if (data.length > 0) {
    const deviceList = document.querySelector("#list-device");

    // reset list
    deviceList.textContent = "";
    deviceList.setAttribute("role", "tablist");

    // append each device element
    data.forEach(dev => {
      const a = document.createElement("a");
      a.id = dev.serial;
      a.className = "list-group-item list-group-item-action";
      a.setAttribute("data-toggle", "list");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-controls", `${dev.name}`);
      a.innerHTML = `${dev.name}`;

      // add event listeners
      a.addEventListener("click", onDeviceClick);

      deviceList.appendChild(a);
    });
  } else {
    // no devices to display; show "add device" button
    document.querySelector("#container-no-devices").style.display = "block";
  }
}

// window event listeners
window.onload = showDeviceList();
