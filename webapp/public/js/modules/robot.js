// https://stackoverflow.com/questions/43796705/how-to-include-cdn-in-javascript-file-js

class Robot {
  constructor(id, client) {
    this._id = id;
    this._client = client;
    this._waypointList = [];
    this._batteryPercentage = undefined;
    this._destination = undefined;
    // this._name = undefined;
    // this._ip_address = undefined;
    // this._waypoint = undefined;
    // this._state = undefined;
  }

  get id() {
    return this._id;
  }

  get batteryPercentage() {
    return this._batteryPercentage;
  }

  set batteryPercentage(value) {
    this._batteryPercentage = value;
  }

  get waypointList() {
    return this._waypointList;
  }

  set waypointList(list) {
    this._waypointList.length = 0;
    list.forEach((waypoint) => {
      this._waypointList.push(waypoint);
    })
  }

  get destination() {
    return this._destination;
  }

  cmdTurnLeft() {
    console.log('[CMD] Turn Left');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: +30 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/turn_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdTurnRight() {
    console.log('[CMD] Turn Left');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: -30 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/turn_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdMoveFwd() {
    console.log('[CMD] Move Forward');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/forward`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdMoveBwd() {
    console.log('[CMD] Move Backward');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/backward`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdTiltUp() {
    console.log('[CMD] Tilt Up');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: 5 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/tilt_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdTiltDown() {
    console.log('[CMD] Tilt Down');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: -5 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/tilt_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdFollow(enable = true) {
    console.log('[CMD] Follow');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    if (enable) {
      message.destinationName = `temi/${this._id}/command/follow/unconstrained`;
    } else {
      message.destinationName = `temi/${this._id}/command/follow/stop`;
    }
    message.qos = 1;
    this._client.send(message);
  }

  cmdGoto(waypoint) {
    console.log('[CMD] Go-To');

    // save destination
    this._destination = waypoint;

    // write payload in JSON format
    const payload = JSON.stringify({ location: waypoint });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/waypoint/goto`;
    message.qos = 1;
    this._client.send(message);
  }

  cmdCall() {
    console.log('[CMD] Call');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/call`;
    message.qos = 1;
    this._client.send(message);
  }

  // https://developer.android.com/reference/android/media/AudioManager#setStreamVolume(int,%20int,%20int)
  cmdVolume(volume) {
    console.log('[CMD] Volume');

    // save destination
    this._volume = value;

    // write payload in JSON format
    const payload = JSON.stringify({ volume: volume });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/volume/absolute`;
    message.qos = 1;
    this._client.send(message);
  }
}

export { Robot };
