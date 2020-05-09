const deviceList = document.querySelector("#list-device");
const deviceNameInput = document.querySelector("#deviceName");
const serialNumberInput = document.querySelector("#serialNumber");

// display device element
function displayDeviceElement(dev) {
  const a = document.createElement("a");
  a.id = dev.serialNumber;
  a.className =
    "list-group-item list-group-item-action flex-column align-items-start";
  a.innerHTML = `<div class="d-flex w-100 justify-content-between">
                  <h5>${dev.name}</h5>
                  <button id="delete-${dev.serialNumber}" type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="d-flex w-100 justify-content-between">
                  <small>${dev.serialNumber}</small>
                </div>`;
  deviceList.appendChild(a);
  document
    .querySelector(`#delete-${dev.serialNumber}`)
    .addEventListener("click", removeDevice);
}

// display devices in a list
function displayDeviceList(list) {
  deviceList.textContent = "";

  list.forEach((dev) => {
    displayDeviceElement(dev);
  });
}

// get devices from database
async function getDevices() {
  const res = await fetch("/devices/get", { method: "GET" });
  const data = await res.json();
  displayDeviceList(data);
}

// add device to database
async function addDevice(e) {
  e.preventDefault();

  const device = {
    name: e.target.elements.deviceName.value,
    serialNumber: e.target.elements.serialNumber.value,
  };

  const res = await fetch("/devices/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(device),
  });

  const data = await res.json();

  if (!("exists" in data)) {
    displayDeviceList(data);

    // clear input fields
    deviceNameInput.value = "";
    serialNumberInput.value = "";
  } else {
    console.log("Device already exists");
    // @TODO Show alert
  }
}

// remove device from database
async function removeDevice(e) {
  const serialNumber = e.target.offsetParent.id;

  const res = await fetch(`/devices/delete?serialNumber=${serialNumber}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!("exists" in data)) {
    displayDeviceList(data);
  }
}

// initialize device list
function init() {
  getDevices();

  // clear inputs
  deviceNameInput.value = "";
  serialNumberInput.value = "";
}

// window event listeners
window.onload = init();

// document event listeners
document
  .querySelector("#form-add-device")
  .addEventListener("submit", addDevice);
