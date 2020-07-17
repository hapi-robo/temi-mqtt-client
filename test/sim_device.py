#!/usr/bin/env python
# -*- coding: utf-8 --
"""Simulate device

"""
import os
import paho.mqtt.client as mqtt
import json
import time

from datetime import datetime
from dotenv import load_dotenv


load_dotenv()

CLIENT_ID = 'sim-device'

# MQTT broker
MQTT_HOSTNAME = os.getenv("MQTT_HOSTNAME")
MQTT_USERNAME = os.getenv("MQTT_USERNAME")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")
MQTT_PORT = 1883

print(MQTT_HOSTNAME)
print(MQTT_USERNAME)
print(MQTT_PASSWORD)

# topics
TOPIC_ALL = 'temi/+/command/#'


def on_connect(client, userdata, flags, rc):
    """Connect to MQTT broker and subscribe to topics

    """
    print("[STATUS] Connected to: {} (rc:{})".format(client._client_id.decode("ascii"), str(rc)))

    # list of subscribed topics
    client.subscribe(topic=TOPIC_ALL, qos=0)


def on_disconnect(client, userdata, rc):
    """Disconnect from MQTT broker

    """
    print("[STATUS] Disconnected from: {} (rc:{})".format(client._client_id.decode("ascii"), str(rc)))
    client.loop_stop()


def on_message(client, log_filename, message):
    """Generic message callback

    """
    print("[{}] {}".format(datetime.now(), message.topic))
    print("{}".format(message.payload))


if __name__ == '__main__':
    # create a new MQTT client instance
    client = mqtt.Client(client_id=CLIENT_ID)

    # attach callbacks
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.message_callback_add(TOPIC_ALL, on_message)

    # connect to MQTT broker
    client.username_pw_set(username=MQTT_USERNAME, password=MQTT_PASSWORD)
    client.connect(
        host = MQTT_HOSTNAME,
        port = MQTT_PORT,
        keepalive = 60,
        bind_address = "")

    # start listening to topics
    client.loop_start()

    while True:
        time.sleep(1)

        # status messages
        print("[{}] Publish Status".format(datetime.now().strftime("%Y%m%d_%H%M%S")))
        client.publish(
            topic='temi/00119140088/status/info', 
            payload=json.dumps({
            'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S"),
            'battery_percentage': 90,
            'waypoint_list': ['home base', 'a', 'b', 'c'], 
            }), 
            qos=0)
