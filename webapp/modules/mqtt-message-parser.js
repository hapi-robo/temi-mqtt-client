// parses incoming MQTT messages

const mqttClient = require("./mqtt-client");
const Device = require("./device");

const deviceListAll = [];

function onEventWaypoint(serialNumber, payload) {
  console.log(serialNumber);
  console.log(payload);
}

function onEventUser(serialNumber, payload) {
  console.log(serialNumber);
  console.log(payload);
}

function onStatusInfo(serialNumber, payload) {
  const device = deviceListAll.find(
    (device) => device.serialNumber === serialNumber
  );
  const data = JSON.parse(payload);
  // console.log(data);

  if (device === undefined) {
    // append to list
    console.log("Append");
    deviceListAll.push(new Device(serialNumber, data));
  } else {
    if (!device.isEqual(data)) {
      // update parameters
      console.log("Update");
      device.update(data);
    }
  }

  // console.log(deviceListAll);
  // console.log(`List Length: ${deviceListAll.length}`);
}

// message event handler
mqttClient.on("message", (topic, payload, packet) => {
  const topicTree = topic.split("/");
  const serialNumber = topicTree[1];
  const type = topicTree[2];
  const category = topicTree[3];

  switch (type) {
    case "status":
      switch (category) {
        case "info":
          onStatusInfo(serialNumber, payload);
          break;

        case "utils":
          console.log(payload);

        default:
          break;
          break;
      }

    case "event":
      switch (category) {
        case "waypoint":
          onEventWaypoint(serialNumber, payload);
          break;

        case "user":
          onEventUser(serialNumber, payload);
          break;

        default:
          break;
      }
  }
});

module.exports = deviceListAll;
