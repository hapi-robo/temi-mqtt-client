const mqttClient = require('./mqtt-client');
const Robot = require('./robot');

const robotListAll = [];

function updateRobotListAll(serialNumber, payload) {
  const robot = robotListAll.find(robot => robot.serialNumber === serialNumber);
  const data = JSON.parse(payload);

  if (robot === undefined) {
    // append to list
    console.log('Append');
    robotListAll.push(new Robot(serialNumber, data));
  } else {
    if (!robot.isEqual(data)) {
      // update parameters
      console.log('Update');
      robot.update(data);
    }
  }

  // console.log(robotListAll);
  // console.log(`List Length: ${robotListAll.length}`);
}

// message even handler
mqttClient.on('message', (topic, message, packet) => {

  const topicTree = topic.split('/');
  const serialNumber = topicTree[1];
  const type = topicTree[2];
  const category = topicTree[3];

  switch (category) {
    case 'info': {
      updateRobotListAll(serialNumber, message);
    }
  }
});

// @TODO Consider using redis to store robotListAll locally
module.exports = robotListAll;