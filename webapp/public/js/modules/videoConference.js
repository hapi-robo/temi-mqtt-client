class VideoConference {
  constructor() {
    this._id = undefined;
    this._handle = undefined;
  }

  open(id) {
    if (this._handle === undefined) {
      this._id = id;
      const domain = 'meet.jit.si';

      // https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
      // https://github.com/jitsi/jitsi-meet/blob/master/config.js
      const options = {
        roomName: `temi-${id}`,
        width: 800,
        height: 600,
        parentNode: document.getElementById('video-container'),
        configOverwrite: {
          enableNoAudioDetection: false
        },
        interfaceConfigOverwrite: {
          DEFAULT_BACKGROUND: '#000000',
          INITIAL_TOOLBAR_TIMEOUT: 1000,
          TOOLBAR_TIMEOUT: 1000,
          TOOLBAR_ALWAYS_VISIBLE: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen', 'fodeviceselection', 'hangup', 'info', 'recording', 'sharedvideo', 'settings', 'filmstrip', 'invite', 'tileview', 'download'],
          SETTINGS_SECTIONS: [ 'devices' ],
          CLOSE_PAGE_GUEST_HINT: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          RANDOM_AVATAR_URL_PREFIX: false,
          RANDOM_AVATAR_URL_SUFFIX: false,
          ENABLE_FEEDBACK_ANIMATION: false,
          DISABLE_FOCUS_INDICATOR: false,
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          MOBILE_APP_PROMO: false,
          SHOW_CHROME_EXTENSION_BANNER: false
        }
      }
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
