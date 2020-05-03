// select robot
function selectRobot(e) {
  console.log(e.target);
  console.log(e.target.offsetParent);
  console.log(e.target.offsetParent.id);
}

// display robots in a list
function displayRobots(list) {
  const robotListGroup = document.querySelector('#list-robot');

  // clear list
  robotListGroup.textContent = '';

  list.forEach(robot => {
    console.log(`${robot.name} ${robot.serialNumber} ${robot.batteryPercentage} ${robot.state}`);

    const a = document.createElement('a');
    a.id = robot.serialNumber;
    if (robot.state === 'Offline') {
      a.className = 'list-group-item list-group-item-action flex-column align-items-start';
      // a.className = 'list-group-item list-group-item-action flex-column align-items-start disabled';
    } else {      
      a.className = 'list-group-item list-group-item-action flex-column align-items-start';
    }
    
    const div = document.createElement('div');
    div.className = 'd-flex w-100 justify-content-between';

    const name = document.createElement('h5');
    name.appendChild(document.createTextNode(robot.name));

    const status = document.createElement('small');
    status.class = 'text-muted';
    status.appendChild(document.createTextNode(robot.state));
    
    const serialNumber = document.createElement('small');
    serialNumber.class = 'text-muted';
    serialNumber.appendChild(document.createTextNode(robot.serialNumber));

    div.appendChild(name);
    div.appendChild(status);

    a.appendChild(div);
    a.appendChild(serialNumber);
    
    a.addEventListener('click', (e) => {
      console.log(`click: ${e.target.id}`);
    });

    a.addEventListener('mouseover', (e) => {
      console.log(`mouseover: ${e.target.id}`);
    });

    a.addEventListener('mouseout', (e) => {
      console.log(`mouseout: ${e.target.id}`);
    });

    robotListGroup.insertBefore(a, robotListGroup.firstChild);
  });
}

// add serial number to database
function addRobot() {
  const serialNumber = document.querySelector('#input-serial-number').value;

  console.log(serialNumber);

  const data = {
    serialNumber: serialNumber
  };

  fetch('/console/add_robot', {
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

// initialize robot list
function init() {
  fetch('/console/robot/get', {
    method: 'GET',
  })
    .then(res => res.json())
    .then(obj => displayRobots(obj))
    .catch(err => console.error(err));
}

window.onload = init();

document.querySelector('#btn-add-robot').addEventListener('click', addRobot);
// document.querySelector('#list-robot').addEventListener('click', selectRobot);
// document.querySelector('#test').addEventListener('click', selectRobot);

document.querySelector('#list-tab').addEventListener('click', function (e) {
  console.log(e.target.id);

  // const a = document.getElementById(e.target.id);
  // a.className += ' list-group-item-primary'
  // console.log(`click`)
})

// document.querySelector('#list-home-list').addEventListener('mouseover', function (e) {
//   console.log(`mouseover`);
// })

// document.querySelector('#list-home-list').addEventListener('mouseout', function (e) {
//   console.log(`mouseout`);
// })