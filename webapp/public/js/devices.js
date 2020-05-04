// Output device to DOM
function outputDevice(device) {
  const a = document.createElement('a');
  a.id = device.serialNumber;
  a.className = 'list-group-item list-group-item-action flex-column align-items-start';
  a.innerHTML =`<div class="d-flex w-100 justify-content-between">
                  <h5>${device.name}</h5>
                  <button id="device-${device.serialNumber}" type="button" class="close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="d-flex w-100 justify-content-between">
                  <small>${device.serialNumber}</small>
                </div>`;
  document.querySelector('#list-device').appendChild(a);
  document.querySelector(`#device-${device.serialNumber}`).addEventListener('click', removeDevice);
}

// Display robots in a list
function displayDevices(list) {
  const deviceListView = document.querySelector('#list-device');

  // clear list
  deviceListView.textContent = '';

  list.forEach(device => {
    console.log(`${device.name} ${device.serialNumber} ${device.batteryPercentage} ${device.state}`);
    outputDevice(device);
  });
}

// get devices from database
function getDevices() {
  fetch('/devices/get', {
    method: 'GET',
  })
    .then(res => res.json())
    .then(obj => displayDevices(obj))
    .catch(err => console.error(err));
}

// add device to database
function addDevice() {
  console.log(`Adding device...`);
  const data = {
    serialNumber: document.querySelector('#input-serial-number').value
  };

  fetch('/devices/add', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(obj => {
      if ('exists' in obj && obj['exists'] === true) {
        console.log(`Device already exists`);
      } else {
        displayDevices(obj);
      }
    })
    .catch(err => console.error(err));
}

// remove device from database
function removeDevice(event) {
  console.log(`Removing device...`);
  const serialNumber = event.target.offsetParent.id;

  fetch(`/devices/delete?serialNumber=${serialNumber}`, {
    method: 'DELETE',
  })
    .then(res => res.json())
    .then(obj => {
      if ('exists' in obj && obj['exists'] === false) {
        console.log(`Device does not exist`);
      } else {
        displayDevices(obj);
      }
    })
    .catch(err => console.error(err));
}

// initialize device list
function init() {
  getDevices();
}

// window event listeners
window.onload = init();

// document event listeners
document.querySelector('#btn-add-device').addEventListener('click', addDevice);
