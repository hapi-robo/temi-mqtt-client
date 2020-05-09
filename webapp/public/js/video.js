// show video
function openVideo() {
  console.log("Starting Video Call...");

  const divVideo = document.querySelector("#div-video");

  // reset video container
  divVideo.textContent = "";

  // https://github.com/jitsi/jitsi-meet/blob/master/config.js
  // https://github.com/jitsi/jitsi-meet/blob/master/interface_config.js
  const options = {
    roomName: `temi-${sessionStorage.getItem("selectedSerialNumber")}`,
    height: window.innerHeight * 0.6,
    parentNode: divVideo,
    interfaceConfigOverwrite: {
      DEFAULT_BACKGROUND: "#ffffff",
      INITIAL_TOOLBAR_TIMEOUT: 1000,
      TOOLBAR_TIMEOUT: 1000,
      TOOLBAR_ALWAYS_VISIBLE: false,
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      TOOLBAR_BUTTONS: [
        "microphone",
        "camera",
        "closedcaptions",
        "fullscreen",
        "fodeviceselection",
        "hangup",
        "filmstrip",
        "tileview",
      ],
      SETTINGS_SECTIONS: ["devices"],
      CLOSE_PAGE_GUEST_HINT: false,
      SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      RANDOM_AVATAR_URL_PREFIX: false,
      RANDOM_AVATAR_URL_SUFFIX: false,
      ENABLE_FEEDBACK_ANIMATION: false,
      DISABLE_FOCUS_INDICATOR: false,
      DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
      MOBILE_APP_PROMO: false,
      SHOW_CHROME_EXTENSION_BANNER: false,
    },
  };

  const videoHandle = new JitsiMeetExternalAPI("meet.jit.si", options);

  // console.log(videoHandle.getIFrame());
}

// @TODO Not yet used
function closeVideo(handle) {
  console.log("Ending Video Call...");

  handle.executeCommand("hangup");
  handle.dispose();
}

document.querySelector("#btn-video").addEventListener("click", openVideo);
