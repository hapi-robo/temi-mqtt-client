class Robot {
  constructor(id, client) {
    this._id = id;
    this._client = client;
    this._name = undefined;
    this._ip_address = undefined;
    this._waypointList = [];
    this._waypoint = undefined;
    this._state = undefined;
    this._batteryPercentage = undefined;
    this._destination = undefined;
    this._volume = undefined;
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

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get waypointList() {
    return this._waypointList;
  }

  // @DEBUG
  // set waypointList(list) {
  //   this._waypointList.length = 0;
  //   console.log(this._waypointList);
  //   console.log(list);
  //   for (i of list) {
  //     this._waypointList.push(i);
  //   }
  //   console.log(this._waypointList);
  // }

  get destination() {
    return this._destination;
  }

  cmdTurnLeft() {
    console.log('[SEND] Turn Left');

    // write payload in JSON format
    const payload = JSON.stringify({angle: +30});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/turn_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdTurnRight() {
    console.log('[SEND] Turn Left');

    // write payload in JSON format
    const payload = JSON.stringify({angle: -30});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/turn_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdMoveFwd() {
    console.log('[SEND] Move Forward');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/forward`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdMoveBwd() {
    console.log('[SEND] Move Backward');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/backward`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdTiltUp() {
    console.log('[SEND] Tilt Up');

    // write payload in JSON format
    const payload = JSON.stringify({'angle': 5});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/tilt_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdTiltDown() {
    console.log('[SEND] Tilt Down');

    // write payload in JSON format
    const payload = JSON.stringify({'angle': -5});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/move/tilt_by`;
    message.qos = 0;
    this._client.send(message);
  }

  cmdFollow(enable = true) {
    console.log('[SEND] Follow');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    let message = new Paho.Message(payload);
    if (enable) {
      message.destinationName = `temi/${this._id}/command/follow/unconstrained`;
    } else {
      message.destinationName = `temi/${this._id}/command/follow/stop`;
    }
    message.qos = 1;
    this._client.send(message);
  }

  cmdGoto(waypoint) {
    console.log('[SEND] GoTo')

    // save destination
    this._destination = waypoint;

    // write payload in JSON format
    const payload = JSON.stringify({'location': waypoint});

    // publish message
    let message = new Paho.Message(payload);
    message.destinationName = `temi/${this._id}/command/waypoint/goto`;
    message.qos = 1;
    this._client.send(message);
  }
}

// export { Robot };