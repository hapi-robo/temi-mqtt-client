class VideoConference {
  constructor() {
    this._id = undefined;
    this._handle = undefined;
  }

  open(id) {
    if (this._handle === undefined) {
      this._id = id;
      const domain = 'meet.jit.si';
      const options = {
        roomName: `temi-${id}`,
        // width: window.innerWidth,
        // height: window.innerHeight,
        width:800,
        height: 400,
        parentNode: document.getElementById('video-conference'),
        configOverwrite: {},
        interfaceConfigOverwrite: {
          filmStripOnly: false,
        },
      };
      console.log(`Open Video: ${id}`);
      this._handle = new JitsiMeetExternalAPI(domain, options);
      
      return this;
    }
  }

  close() {
    if (this._handle !== undefined) {
      console.log(`Close Video: ${this._id}`);
      this._handle.executeCommand('hangup');
      this._id = undefined;
      this._handle = undefined;
    }
  }

  get handle() {
    return this._handle;
  }


}

export { VideoConference };
