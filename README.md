## myhome-mqtt-bridge

Docker image to connect a bticino/legrand myhome gateway to an mqtt broker.

'''
docker run \
  --name myhome-mqtt-bridge \
  -e MQTT_URL="mqtt://10.0.10.101:1883" \
  -e MQTT_USER="mqttuser" \
  -e MQTT_PASSWORD="mqttpassword" \
  -e MQTT_DISCOVERY="true" \
  -e MQTT_TOPIC_PREFIX="homeassistant" \
  -e MYHOME_HOST="10.0.10.35" \
  -e MYHOME_PORT="20000" \
  -e MYHOME_PASSWORD="00000" \
  carabila/myhome-mqtt-bridge:latest
'''

MQTT_DISCOVERY="true" pushes the topic "config" to allow Home-Assistant autodiscovery.
Currently working for lights (who=1), shutters (who=2) and motion pir sensors (who=9).