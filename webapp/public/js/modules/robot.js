// https://stackoverflow.com/questions/43796705/how-to-include-cdn-in-javascript-file-js

class Robot {
  #id;
  #client;
  #batteryPercentage;
  #waypointList;
  #destination

  constructor(id, client) {
    this.#id = id;
    this.#client = client;
    // this._name = undefined;
    // this._ip_address = undefined;
    this.#waypointList = [];
    // this._waypoint = undefined;
    // this._state = undefined;
    this.#batteryPercentage = undefined;
    this.#destination = undefined;
    // this._volume = undefined;
  }

  get id() {
    return this.#id;
  }

  get batteryPercentage() {
    return this.#batteryPercentage;
  }

  set batteryPercentage(value) {
    this.#batteryPercentage = value;
  }

  get waypointList() {
    return this.#waypointList;
  }

  set waypointList(list) {
    this.#waypointList.length = 0;
    list.forEach((waypoint) => {
      this.#waypointList.push(waypoint);
    })
  }

  get destination() {
    return this.#destination;
  }

  cmdTurnLeft() {
    console.log('[SEND] Turn Left');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: +30 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/move/turn_by`;
    message.qos = 0;
    this.#client.send(message);
  }

  cmdTurnRight() {
    console.log('[SEND] Turn Left');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: -30 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/move/turn_by`;
    message.qos = 0;
    this.#client.send(message);
  }

  cmdMoveFwd() {
    console.log('[SEND] Move Forward');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/move/forward`;
    message.qos = 0;
    this.#client.send(message);
  }

  cmdMoveBwd() {
    console.log('[SEND] Move Backward');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/move/backward`;
    message.qos = 0;
    this.#client.send(message);
  }

  cmdTiltUp() {
    console.log('[SEND] Tilt Up');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: 5 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/move/tilt_by`;
    message.qos = 0;
    this.#client.send(message);
  }

  cmdTiltDown() {
    console.log('[SEND] Tilt Down');

    // write payload in JSON format
    const payload = JSON.stringify({ angle: -5 });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/move/tilt_by`;
    message.qos = 0;
    this.#client.send(message);
  }

  cmdFollow(enable = true) {
    console.log('[SEND] Follow');

    // write payload in JSON format
    const payload = JSON.stringify({});

    // publish message
    const message = new Paho.Message(payload);
    if (enable) {
      message.destinationName = `temi/${this.#id}/command/follow/unconstrained`;
    } else {
      message.destinationName = `temi/${this.#id}/command/follow/stop`;
    }
    message.qos = 1;
    this.#client.send(message);
  }

  cmdGoto(waypoint) {
    console.log('[SEND] GoTo');

    // save destination
    this.#destination = waypoint;

    // write payload in JSON format
    const payload = JSON.stringify({ location: waypoint });

    // publish message
    const message = new Paho.Message(payload);
    message.destinationName = `temi/${this.#id}/command/waypoint/goto`;
    message.qos = 1;
    this.#client.send(message);
  }
}

export { Robot };
