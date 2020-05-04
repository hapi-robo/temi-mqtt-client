// Output robot to DOM
function outputRobot(robot) {
  const a = document.createElement('a');
  a.id = robot.serialNumber;
  a.className = 'list-group-item list-group-item-action flex-column align-items-start';
  a.innerHTML =`<div class="d-flex w-100 justify-content-between">
                  <h5>${robot.name}</h5>
                  <button id="${robot.serialNumber}" type="button" class="close" aria-label="Close" onclick="removeRobot()">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="d-flex w-100 justify-content-between">
                  <small>${robot.serialNumber}</small>
                </div>`;
  document.querySelector('#list-robot').appendChild(a);
}

// Display robots in a list
function displayRobots(list) {
  const robotListView = document.querySelector('#list-robot');

  // clear list
  robotListView.textContent = '';

  list.forEach(robot => {
    console.log(`${robot.name} ${robot.serialNumber} ${robot.batteryPercentage} ${robot.state}`);
    outputRobot(robot);
  });
}

// add serial number to database
function addRobot() {
  const serialNumber = document.querySelector('#input-serial-number').value;

  console.log(serialNumber);

  const data = {
    serialNumber: serialNumber
  };

  fetch('/devices/add', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(obj => displayRobots(obj))
    .catch(err => console.error(err));
}

function removeRobot(event) {
  console.log(event.target.id);
}

// initialize robot list
function init() {
  fetch('/devices/get', {
    method: 'GET',
  })
    .then(res => res.json())
    .then(obj => displayRobots(obj))
    .catch(err => console.error(err));
}

// Event listeners
window.onload = init();

document.querySelector('#btn-add-robot').addEventListener('click', addRobot);
