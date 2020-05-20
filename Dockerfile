FROM node:alpine

WORKDIR '/app'

ENV MQTT_URL="mqtt://10.0.10.101:1883"
ENV MQTT_USER="mqttuser"
ENV MQTT_PASSWORD="mqttpassword"
ENV MQTT_DISCOVERY="true"
ENV MQTT_TOPIC_PREFIX="homeassistant"

ENV MYHOME_HOST="10.0.10.35"
ENV MYHOME_PORT="20000"
ENV MYHOME_PASSWORD="00000"

COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "start"]