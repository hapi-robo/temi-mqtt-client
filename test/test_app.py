#!/usr/bin/env python
# -*- coding: utf-8 --

"""Publish MQTT servo messages.
Publishes MQTT servo messages to MQTT broker.
Example usage:
    python test.py
"""
from datetime import datetime

import paho.mqtt.client as mqtt
import json
import time


CLIENT_ID = 'test-webapp'

# MQTT broker
MQTT_BROKER_HOST = '192.168.0.118';
MQTT_BROKER_PORT = 1883;

# connection parameters
MQTT_BROKER_RETRY_ATTEMPT = 5 # number of retry attempts
MQTT_BROKER_RETRY_TIMEOUT = 10 # [seconds]


def mqtt_init():
    """Setup and start MQTT client

    """
    # create a new client instance
    client = mqtt.Client(client_id = CLIENT_ID)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    # connect to MQTT broker
    mqtt_connect(client)

    # start listening to topics
    client.loop_start()

    return client


if __name__ == '__main__':
    # create a new MQTT client instance
    client = mqtt.Client(client_id=CLIENT_ID)

    # attach callbacks
    # client.on_publish = on_publish

    # connect to MQTT broker
    client.connect(
        host = MQTT_BROKER_HOST,
        port = MQTT_BROKER_PORT,
        keepalive = 60,
        bind_address = "")

    # client.publish('temi/001192452440/status/info', json.dumps({
    #     'battery_percentage': 95,
    #     'locations': ['home base'], 
    #     }), qos=0)

    time.sleep(0.5)
    while True:
        client.publish('temi/001192452440/status/info', json.dumps({
            'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S"),
            'battery_percentage': 95,
            'locations': ['home base', 'a', 'b', 'c'], 
            }), qos=0)
        time.sleep(3)

        client.publish('temi/001192462420/status/info', json.dumps({
            'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S"),
            'battery_percentage': 95,
            'locations': ['home base', 'a', 'b', 'c'], 
            }), qos=0)
        time.sleep(3)
