class VideoConference {
  #id;
  #handle;

  constructor() {
    this.#id = undefined;
    this.#handle = undefined;
  }

  open(id) {
    if (this.#handle === undefined) {
      this.#id = id;
      const domain = 'meet.jit.si';
      const options = {
        roomName: `temi-${id}`,
        // width: window.innerWidth,
        height: window.innerHeight,
        parentNode: document.getElementById('video-conference'),
        configOverwrite: {},
        interfaceConfigOverwrite: {
          filmStripOnly: false,
        },
      };
      console.log(`Open Video: ${id}`);
      // this.#handle = true;
      // this.#handle = new JitsiMeetExternalAPI(domain, options);
      
      return this;
    }
  }

  close() {
    if (this.#handle !== undefined) {
      console.log(`Close Video: ${this.#id}`);
      this.#handle.executeCommand('hangup');
      this.#id = undefined;
      this.#handle = undefined;
      // let val = document.getElementById('video-conference');
      // val.textContent = '';
      // console.log(val);
    }
  }

  get handle() {
    return this.#handle;
  }


}

export { VideoConference };
