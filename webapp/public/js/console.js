// global variables
let selectedSerialNumberList = [];

// display devices in a list
function deviceListView(list) {
  const listDevice = document.querySelector("#list-device");

  // reset list
  listDevice.textContent = "";

  // append each device element
  list.forEach((device) => {
    // output device to DOM
    const a = document.createElement("a");
    a.id = device.serialNumber;
    a.className = "list-group-item";
    a.innerHTML = `${device.name}`;

    a.addEventListener("click", (event) => {
      if (a.className.search("active") > -1) {
        a.className = "list-group-item";

        // @TODO only when CTRL is pressed
        // remove device from selection
        const index = selectedSerialNumberList.indexOf(device.serialNumber);
        if (index > -1) {
          selectedSerialNumberList.splice(index, 1);
        }
      } else {
        a.className = "list-group-item text-light active";

        // @TODO only when CTRL is pressed
        // add device to selection
        selectedSerialNumberList.push(device.serialNumber);
      }

      // show device details
      const deviceDetails = document.querySelector("#div-device-details");
      if (selectedSerialNumberList.length === 1) {
        sessionStorage.setItem("selectedSerialNumber", event.target.id);
        deviceDetails.style.display = "block";
        showDeviceInfo(a.id);
      } else {
        sessionStorage.setItem("selectedSerialNumber", null);
        deviceDetails.style.display = "none";
      }
    });

    a.addEventListener("mouseover", (event) => {
      if (a.className.search("active") === -1) {
        a.className = "list-group-item";
      }
    });

    a.addEventListener("mouseout", (event) => {
      if (a.className.search("active") === -1) {
        a.className = "list-group-item";
      }
    });

    listDevice.appendChild(a);
  });
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
        deviceListView(obj);
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

// window.onresize = () => {
//   const width = document.querySelector('#video-container').offsetWidth;
//   const height = document.querySelector('#video-container').offsetHeight;

//   console.log(`w: ${width} x h: ${height}`);
//   console.log(`w: ${window.innerWidth} x h: ${window.innerHeight}`);
// }
