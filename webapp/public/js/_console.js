const deviceList = document.querySelector("#list-device");
let selectedSerialNumberList = [];


function onDeviceClick(e) {
  const serialNumber = e.target.id;

  // add device to selection list
  if (this.className.search("active") > -1) {
    this.className = "list-group-item";

    // @TODO only when CTRL is pressed
    // remove device from selection
    const index = selectedSerialNumberList.indexOf(serialNumber);
    if (index > -1) {
      selectedSerialNumberList.splice(index, 1);
    }
  } else {
    this.className = "list-group-item text-light active";

    // @TODO only when CTRL is pressed
    // add device to selection
    selectedSerialNumberList.push(serialNumber);
  }

  // show device details
  const deviceDetails = document.querySelector("#div-device-details");
  if (selectedSerialNumberList.length === 1) {
    sessionStorage.setItem("selectedSerialNumber", serialNumber);
    deviceDetails.style.display = "block";
    showDeviceInfo(this.id);
  } else {
    sessionStorage.setItem("selectedSerialNumber", null);
    deviceDetails.style.display = "none";
  }
}

function onDeviceHoverIn() {
  if (this.className.search("active") === -1) {
    this.className = "list-group-item";
  }
}

function onDeviceHoverOut() {
  if (this.className.search("active") === -1) {
    this.className = "list-group-item";
  }
}

function displayDeviceElement(dev) {
  // plain list group
  const a = document.createElement("a");
  a.id = dev.serialNumber;
  a.className = "list-group-item";
  a.innerHTML = `${dev.name}`;

  // bootstrap list group
  // const a = document.createElement('a');
  // a.id = dev.serialNumber;
  // a.className = "list-group-item list-group-item-action";
  // a.setAttribute('data-toggle', 'list');
  // a.setAttribute('role', 'tab');
  // a.setAttribute('aria-controls', `${dev.name}`);
  // a.innerHTML = `${dev.name}`;

  // add event listeners
  a.addEventListener("click", onDeviceClick);
  a.addEventListener("mouseover", onDeviceHoverIn);
  a.addEventListener("mouseout", onDeviceHoverOut);

  deviceList.appendChild(a);
}

// display devices in a list
function displayDeviceList(list) {
  // reset list
  deviceList.textContent = '';

  // append each device element
  list.forEach((dev) => displayDeviceElement(dev));
}

// display device information
function deviceInfoView(obj, serialNumber) {
  console.log(serialNumber);
  console.log(obj);
  const device = obj.find((elem) => elem["serialNumber"] === serialNumber);

  // reset state
  document.querySelector("#device-serial").innerHTML = serialNumber;
  document.querySelector("#device-battery").innerHTML = "";

  const selectGoto = document.querySelector("#select-goto");
  selectGoto.innerHTML = ""; // reset content

  if (device !== undefined) {
    if (device.batteryPercentage === undefined) {
      document.querySelector("#device-battery").innerHTML = `Unknown`;
    } else {
      document.querySelector(
        "#device-battery"
      ).innerHTML = `${device.batteryPercentage}%`;
    }

    // construct waypoint list
    const option = document.createElement("option");
    option.disabled = true;
    option.selected = true;
    option.style.display = "none";
    option.textContent = "Choose Location...";
    selectGoto.appendChild(option);

    device.waypointList.forEach((waypointName) => {
      const option = document.createElement("option");
      option.value = waypointName;
      option.textContent = waypointName;
      selectGoto.appendChild(option);
    });
  } else {
    console.log("Device: Offline");
  }
}

// show device list
function showDeviceList() {
  fetch("/devices/get", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((obj) => {
      if (obj.length > 0) {
        displayDeviceList(obj);
      } else {
        // no devices to display, show "add device button"
        console.log("No devices to display");
        document.querySelector("#container-no-devices").style.display = "block";
      }
    })
    .catch((err) => console.error(err));
}

// show device information
function showDeviceInfo(serialNumber) {
  fetch("/devices/info", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((obj) => deviceInfoView(obj, serialNumber))
    .catch((err) => console.error(err));
}

function cmdGoto(event) {
  const waypoint = document.querySelector("#select-goto").value;
  console.log(`Goto: ${waypoint}`);

  fetch("/command/goto", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      serialNumber: sessionStorage.getItem("selectedSerialNumber"),
      waypoint: waypoint,
    }),
  })
    .then((res) => res.json())
    .then((obj) => console.log(obj))
    .catch((err) => console.error(err));
}

// initialize device list
function init() {
  showDeviceList();
}

// window event listeners
window.onload = init();

// element event listener
document.querySelector("#btn-goto").addEventListener("click", cmdGoto);
