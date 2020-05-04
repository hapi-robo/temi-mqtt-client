// global variables
let selectedDevices = [];

// output device details to DOM
function outputDeviceDetails(device) {

}

// output device to DOM
function outputDevice(device) {
  const a = document.createElement('a');
  a.id = device.serialNumber;
  a.className = 'list-group-item';
  a.innerHTML =`${device.name}`;
  
  a.addEventListener('click', event => {
    if (a.className.search("active") > -1) {
      a.className = 'list-group-item';

      // remove device from selection
      const index = selectedDevices.indexOf(device.serialNumber);
      if (index > -1) {
        selectedDevices.splice(index, 1);
      }
    } else {
      a.className = 'list-group-item text-light active';

      // add device to selection
      selectedDevices.push(device.serialNumber);
    }
    console.log(selectedDevices);
  });

  a.addEventListener('mouseover', event => {
    if (a.className.search("active") === -1) {
      a.className = 'list-group-item bg-light';
    }
  });

  a.addEventListener('mouseout', event => {
    if (a.className.search("active") === -1) {
      a.className = 'list-group-item bg-white';
    }
  });
  
  document.querySelector('#list-device').appendChild(a);
}

// display device in a list
function displayDevices(list) {
  const deviceListView = document.querySelector('#list-device');

  // clear list
  deviceListView.textContent = '';

  list.forEach(device => {
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

// initialize device list
function init() {
  getDevices();
}

// window event listeners
window.onload = init();
