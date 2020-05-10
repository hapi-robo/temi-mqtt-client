const deviceNameInput = document.querySelector("#deviceName");
const deviceSerialInput = document.querySelector("#deviceSerial");

// display devices in a list
function showDeviceList(list) {
  const deviceList = document.querySelector("#list-device");

  // reset list
  deviceList.textContent = "";

  // append each device element
  list.forEach(dev => {
    const a = document.createElement("a");
    a.id = dev.serial;
    a.className =
      "list-group-item list-group-item-action flex-column align-items-start";
    a.innerHTML = `<div class="d-flex w-100 justify-content-between">
                    <h5>${dev.name}</h5>
                    <button id="delete-${dev.serial}" type="button" class="close" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="d-flex w-100 justify-content-between">
                    <small>${dev.serial}</small>
                  </div>`;
    deviceList.appendChild(a);
    document
      .querySelector(`#delete-${dev.serial}`)
      .addEventListener("click", deleteDevice);
  });
}

// get devices from database
async function getDevices() {
  const res = await fetch("/devices/get", { method: "GET" });
  const data = await res.json();
  showDeviceList(data);
}

// add device to database
async function addDevice(e) {
  e.preventDefault();

  const device = {
    name: e.target.elements.deviceName.value,
    serial: e.target.elements.deviceSerial.value
  };

  const res = await fetch("/devices/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(device)
  });

  const data = await res.json();

  if (!("exists" in data)) {
    showDeviceList(data);

    // clear input fields
    deviceNameInput.value = "";
    deviceSerialInput.value = "";
  } else {
    console.log("Device already exists");
    // @TODO Show alert
  }
}

// remove device from database
async function deleteDevice(e) {
  const serial = e.target.offsetParent.id;

  const res = await fetch(`/devices/delete?serial=${serial}`, {
    method: "DELETE"
  });

  const data = await res.json();

  if (!("exists" in data)) {
    showDeviceList(data);
  }
}

// initialize device list
function init() {
  getDevices();

  // clear inputs
  deviceNameInput.value = "";
  deviceSerialInput.value = "";
}

// window event listeners
window.onload = init();

// document event listeners
document
  .querySelector("#form-add-device")
  .addEventListener("submit", addDevice);
