# Connect Webapp

This is a webapp built on Node.js/Express.

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
