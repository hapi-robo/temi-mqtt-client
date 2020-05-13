# Connect
A free and open-source alternative to [temi](https://www.robotemi.com/)'s default video-conferencing application.

This is still a prototype. This project uses MQTT for message transport between the client's web-brower user-interface and robot. It uses [Jitsi-Meet](https://jitsi.org/), a free open-source WebRTC framework, for video conferencing.

The project consists of 3 components:
1. **Web Application**. A web-browser application used to tele-operate the robot.
2. **Android App.** An application that bridges robot commands/events and MQTT messages, which is to be installed on the robot.
3. **MQTT broker.** [Eclipe Mosquitto](https://mosquitto.org/) open-source MQTT broker.


## Folder Structure
```
jitsi-temi              Root directory
├─ android              Android application to be installed on temi
├─ config               MQTT broker configuration files
├─ mosquitto            MQTT broker
├─ test                 Various test scripts
└─ webapp               NodeJS/Express web server and client application
```


## Repository Structure
There are 2 main branches: `master` and `devel`. Releases are generated from the `master` branch. All development takes place on the `devel` branch.


## Getting Started

### Prerequisites
* [temi robot](https://www.robotemi.com/)
* [Android Studio](https://developer.android.com/studio/)
* Computer/Server with the following installed:
    * [Docker](https://docs.docker.com/install/)
    * [Docker Compose](https://docs.docker.com/compose/install/)
* Client computer with [Chrome](https://www.google.com/chrome/) web-browser

### Build & Deploy Web Application Services
On your host machine, clone the repository and update submodules:
```
git clone https://github.com/ray-hrst/jitsi-temi.git
git submodule update --init --recursive
```

Currently, the hostname is hard-coded into the webapp. Look for a call to the function `connectMQTT()` in `main.js` (somewhere near the end). Replace the value with your machine's hostname/IP-address:
```
hostname -I
```

From the `root` directory, build and deploy the MQTT broker and web application services:
```
cd jitsi-temi/
docker-compose build
docker-compose up
```

### Install Android App
Install the Android APK onto your robot, see [instructions](https://github.com/robotemi/sdk/wiki/Installing-and-Uninstalling-temi-Applications) for details. The application is called `Connect`. The Android app is available under [releases](https://github.com/ray-hrst/jitsi-temi/releases). 

To build from source, clone the repository:
```
git clone https://github.com/ray-hrst/jitsi-temi.git
```

From the `android` directory, build the Android app using Android Studio. Alternatively, you can try to build the app from the command line:
```
cd android/
./gradlew build
```
You will find the Android APK at `app/build/outputs/apk/debug/app-debug.apk`.

### Usage
Start the `Connect` app on temi. Type in the `hostname` of your machine into the provided text-field, and press `Connect`.

On a computer connected to the same network as your host machine, open a web-browser and enter your host machine's hostname into the address bar.

If everything is working correctly, you should see your temi's serial number appear in the web application. Click it to start tele-operating the robot.


## Attributions
This project would not have been made possible without the help of other open-source projects:
* [Jitsi](https://jitsi.org/)
* [Eclipe Paho](https://www.eclipse.org/paho/)
