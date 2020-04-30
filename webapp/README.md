# Connect Web Application

This is a web application built on Node.js/Express. It uses the [Materialize](https://materializecss.com/) front-end framework for styling, [Eclipse Paho JavaScript Client](https://www.eclipse.org/paho/clients/js/) for communicating with the MQTT broker over WebSockets, and the [Jitsi-Meet API](https://github.com/jitsi/jitsi-meet/blob/master/doc/api.md) for video-conferencing.

The instructions provided below are for building and deploying the web application standalone. For running the complete project, it is recommended to use Docker Compose from the root directory.

## Prerequisites

### Docker

For installation instructions on Ubuntu, see: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04

For installation instructions on Rasbian:

```
curl -fsSL https://download.docker.com/linux/raspbian/gpg | sudo apt-key add -
echo "deb [arch=armhf] https://download.docker.com/linux/raspbian stretch stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update
sudo apt-get install docker-ce
sudo usermod -aG docker pi && logout
```

### MQTT Broker with Websocket Support

See: https://github.com/eclipse/mosquitto

Free online brokers:

-   [Docker Mosquitto](https://github.com/toke/docker-mosquitto)
-   [Online Mosquitto Broker](https://test.mosquitto.org)
-   [Online HiveMQ Broker](https://broker.hivemq.com)

## Build Image

```
$ docker build -t <username>/webapp .
```

## Run Container

```
docker run --restart unless-stopped -d -p 80:8080 connect/webapp
```

-   The `--restart unless-stopped` flag starts the container (e.g. at boot) unless it is manually stopped.
-   The `-d` flag runs the container in detached mode, leaving the container running in the background.
-   The `-p` flag redirects a public port to a private port inside the container. This image exposes port 1883 (MQTT) and 9001 (MQTT with websockets).

## Usage

On the same computer, point your browser to [http://localhost](http://localhost).

## Self-Signed Certificate
* [Certificates for localhost](https://letsencrypt.org/docs/certificates-for-localhost/)
* [Firefox Certificates Can't be Installed](https://security.stackexchange.com/questions/163199/firefox-certificate-can-t-be-installed)
	```
	openssl pkcs12 -export -in localhost.crt -inkey localhost.key -out localhost.p12
	```
* [How to Fix Mozilla Firefox Error](https://aboutssl.org/how-to-fix-mozilla-pkix-self-signed-cert-error/)