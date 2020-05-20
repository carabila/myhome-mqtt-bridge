module.exports = {
    mqtt_config: {
        url: process.env.MQTT_URL, //'mqtt://10.0.10.101:1883',
        clientId: 'myome-bridge_' + Math.round(Math.random()*100),
        discovery: process.env.MQTT_DISCOVERY, // true | false
        topic_prefix: process.env.MQTT_TOPIC_PREFIX, 
        mqtt_options: {
            username: process.env.MQTT_USER, //'mqttuser',
            password: process.env.MQTT_PASSWORD, //'mqttpassword',
            keepalive: 60,
            reconnectPeriod: 1000,
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clean: true,
            encoding: 'utf8'
        }
    },
    myhome_config: {
        host: process.env.MYHOME_HOST,
        port: process.env.MYHOME_PORT,
        pass: process.env.MYHOME_PASSWORD //myHomePassword //'12345'
    }
};
