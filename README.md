# jitsi-temi
A free and open-source alternative to temi's default video-conferencing application.


## TL;DR
Install APK onto temi.
```
adb connect <ip-address>
adb install connect.apk
```

Start the MQTT broker and web-server:
```
docker-compose build
docker-compose up
```

Start the `Connect` app on temi. Type in the IP-address of the MQTT broker and press `Connect`.

In your web-browser, type the IP-address of the web-server.

If everything is working correctly, you should see your temi's serial number appear. Click it to start tele-operations.


## Attributions
This project would not have been made possible without the help of other open-source projects:
* [Jitsi](https://jitsi.org/)
* [Eclipe Paho](https://www.eclipse.org/paho/)
