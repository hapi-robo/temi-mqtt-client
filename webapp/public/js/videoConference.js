class VideoConference {
  constructor() {
    this._id = undefined;
    this._handle = undefined;
  }

  open(id) {
    if (this._handle == undefined) {
      this._id = id;
      const domain = "meet.jit.si"
      const options = {
        roomName: `temi-${id}`,
        // width: window.innerWidth,
        height: window.innerHeight,
        parentNode: document.getElementById('video-conference'),
        configOverwrite: {},
        interfaceConfigOverwrite: {
            filmStripOnly: false
        }
      }
      console.log(`Open Video: ${id}`);
      // this._handle = true;
      this._handle = new JitsiMeetExternalAPI(domain, options);
    }
  }

  close() {
    if (this._handle != undefined) {
      console.log(`Close Video: ${this._id}`);
      this._handle.executeCommand('hangup');
      this._id = undefined;
      this._handle = undefined;
      // let val = document.getElementById('video-conference');
      // val.textContent = '';
      // console.log(val);
    }
  }

  get handle() {
    return this._handle;
  }
}

// global variables
let vidCon = new VideoConference();