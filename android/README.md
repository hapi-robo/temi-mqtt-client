# Connect Android Application

This is an Android application built using [Eclipse Paho JavaScript Client](https://www.eclipse.org/paho/clients/js/) for communicating with the MQTT broker, [Jitsi-Meet SDK for Android](https://github.com/jitsi/jitsi-meet/tree/master/android) for video-conferencing, and the [temi SDK](https://github.com/robotemi/sdk) for robot control and event handling.

Important Files:
* android/build.gradle
* android/app/build.gradle
* android/app/src/main/AndroidManifest.xml
* android/app/src/main/res/values/strings.xml
* android/app/src/main/res/layout/activity_main.xml
* android/app/src/main/java/com/hapirobo/connect/MainActivity.java

## Installation
Since the `testOnly` flag is set to `true`, use the `-t` flag to install:
```
adb install -t <apk-filename>
```
