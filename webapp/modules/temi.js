// temi MQTT commander class

class Temi {
  constructor(client) {
    this.client = client;
  }

  rotate(id, value) {
    console.log(`[CMD] Rotate: ${value}`);

    if (value === 0) {
      // do nothing
    } else {
      const topic = `temi/${id}/command/move/turn_by`;
      const payload = JSON.stringify({ angle: 30 * Math.sign(value) });

      this.client.publish(topic, payload, { qos: 0 });
    }
  }

  translate(id, value) {
    console.log(`[CMD] Translate: ${value}`);

    let topic;
    if (Math.sign(value) > 0) {
      topic = `temi/${id}/command/move/forward`;
      this.client.publish(topic, "{}", { qos: 0 });
    } else if (Math.sign(value) < 0) {
      topic = `temi/${id}/command/move/backward`;
      this.client.publish(topic, "{}", { qos: 0 });
    } else {
      // do nothing
    }
  }

  tilt(id, value) {
    console.log(`[CMD] Tilt: ${value}`);

    if (value === 0) {
      // do nothing
    } else {
      const topic = `temi/${id}/command/move/tilt`;
      const payload = JSON.stringify({ angle: 30 * value });
      this.client.publish(topic, payload, { qos: 0 });
    }
  }

  tiltBy(id, value) {
    console.log(`[CMD] Tilt-by: ${value}`);

    if (value === 0) {
      // do nothing
    } else {
      const topic = `temi/${id}/command/move/tilt_by`;
      const payload = JSON.stringify({ angle: 15 * Math.sign(value) });
      this.client.publish(topic, payload, { qos: 0 });
    }
  }

  tiltUp(id) {
    console.log("[CMD] Tilt Up");

    const topic = `temi/${id}/command/move/tilt_by`;
    const payload = JSON.stringify({ angle: 5 });

    this.client.publish(topic, payload, { qos: 0 });
  }

  tiltDown(id) {
    console.log("[CMD] Tilt Down");

    const topic = `temi/${id}/command/move/tilt_by`;
    const payload = JSON.stringify({ angle: -5 });

    this.client.publish(topic, payload, { qos: 0 });
  }

  follow(id, enable = true) {
    console.log(`[CMD] Follow: ${enable}`);

    let topic;
    if (enable) {
      topic = `temi/${id}/command/follow/unconstrained`;
    } else {
      topic = `temi/${id}/command/follow/stop`;
    }

    this.client.publish(topic, "{}", { qos: 1 });
  }

  goto(id, waypoint) {
    console.log(`[CMD] Go-To: ${waypoint}`);

    const topic = `temi/${id}/command/waypoint/goto`;
    const payload = JSON.stringify({ location: waypoint });

    this.client.publish(topic, payload, { qos: 1 });
  }

  call(id) {
    console.log("[CMD] Call");

    const topic = `temi/${id}/command/call`;

    this.client.publish(topic, "{}", { qos: 1 });
  }

  hangup(id) {
    console.log("[CMD] Hangup");

    const topic = `temi/${id}/command/hangup`;

    this.client.publish(topic, "{}", { qos: 1 });
  }

  tts(id, utterance) {
    console.log(`[CMD] TTS: ${utterance}`);

    const topic = `temi/${id}/command/tts`;
    const payload = JSON.stringify({ utterance });

    this.client.publish(topic, payload, { qos: 1 });
  }

  // https://developer.android.com/reference/android/media/AudioManager#setStreamVolume(int,%20int,%20int)
  volume(id, volume) {
    console.log(`[CMD] Volume: ${volume}`);

    const topic = `temi/${id}/command/volume/absolute`;
    const payload = JSON.stringify({ volume });

    this.client.publish(topic, payload, { qos: 1 });
  }
}

module.exports = Temi;
