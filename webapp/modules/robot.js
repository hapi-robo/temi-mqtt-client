function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

class Robot {
  // constructor
  constructor(serialNumber, obj = {}) {
    // identification
    this.serialNumber = serialNumber;

    // reset parameters
    this.reset();

    // update parameters
    this.update(obj);
  }

  // check if parameters are identical
  isEqual(obj) {
    // identification
    if (this.name !== obj['name']) { return false }
    if (this.ip !== obj['ip']) { return false }

    // state
    if (this.state !== obj['state']) { return false }
    if (this.batteryPercentage !== obj['batteryPercentage']) { return false }

    // navigation
    if (this.destination !== obj['destination']) { return false }
    if (!arraysEqual(this.waypointList, obj['waypointList'])) { return false }

    return true;
  }

  // update parameters
  update(obj) {
    // identification
    if (obj['name']) { this.name = obj['name']; }
    if (obj['ip']) { this.ip = obj['ip'] }

    // state
    if (obj['state']) { this.state = obj['state'] }
    if (obj['batteryPercentage']) { this.batteryPercentage = obj['batteryPercentage'] }

    // navigation
    if (obj['destination']) { this.destination = obj['destination'] }
    if (obj['waypointList']) { this.waypointList = obj['waypointList'] }

    // timestamp
    this.date = Date.now();
  }

  // reset parameters
  reset() {
    // identification
    this.name = 'Untitled';
    this.ip = undefined;

    // state
    this.state = undefined;
    this.batteryPercentage = undefined;

    // navigation
    this.destination = undefined;
    this.waypointList = [];

    this.date = undefined;
  }
}

module.exports = Robot;