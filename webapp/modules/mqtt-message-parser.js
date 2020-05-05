const mqttClient = require('./mqtt-client');
const Device = require('./device');

const deviceListAll = [];

function updateDeviceListAll(serialNumber, payload) {
  const device = deviceListAll.find(device => device.serialNumber === serialNumber);
  const data = JSON.parse(payload);

  if (device === undefined) {
    // append to list
    console.log('Append');
    deviceListAll.push(new Device(serialNumber, data));
  } else {
    if (!device.isEqual(data)) {
      // update parameters
      console.log('Update');
      device.update(data);
    }
  }

  // console.log(deviceListAll);
  // console.log(`List Length: ${deviceListAll.length}`);
}

// message even handler
mqttClient.on('message', (topic, message, packet) => {

  const topicTree = topic.split('/');
  const serialNumber = topicTree[1];
  const type = topicTree[2];
  const category = topicTree[3];

  switch (category) {
    case 'info': {
      // @TODO Use socket.io to update console data
      updateDeviceListAll(serialNumber, message);
    }
  }
});

module.exports = deviceListAll;