var myhome = require('myhome');
var mqtt = require('mqtt');
const config = require('./config');

var scs_mqtt = {
    'light': '1',
    'cover': '2',
    'binary_sensor': '9'
};
for (var key in scs_mqtt) {
    scs_mqtt[scs_mqtt[key]] = key;
};

// Reduce the number of call to publish the configuration
var mqtt_published_cfg = [];

console.log("Connecting to MQTT " + config.mqtt_config.url);
var client = mqtt.connect(config.mqtt_config.url, config.mqtt_config.mqtt_options);

var parsePacket = function(data) {
    var res = data.match(/\*\d+\*(0|1|2)\*\d+##/g);
    if (res) {
        res = res[0].match(/\d+/g);
        return  {
            chi: res[0],
            cosa: res[1],
            dove: res[2]
        };
    }
    return null;
};

var mqtt2scs = function(topic, payload) {
    var pkt = topic.split("/");
    return  {
        chi: scs_mqtt[pkt[1]],
        cosa: payload,
        dove: pkt[2]
    };
};

// home-assistant mqtt autodiscovery
var publish_cfg = function(topic) {
    var data = mqtt2scs(topic, "*");
    var payload = null;
    switch (data.chi) {
        case ('1'):
            payload = {
                "~": topic,
                name: data.chi + '_' + data.dove,
                unique_id: data.chi + '_' + data.dove,
                stat_t: '~/state',
                command_topic: '~/set',
                payload_on: '1',
                payload_off: '0'
            }
            break;

        case ('2'):
            payload = {
                "~": topic,
                name: data.chi + '_' + data.dove,
                unique_id: data.chi + '_' + data.dove,
                command_topic: '~/set',
                payload_open: '1',
                payload_stop: '0',
                payload_close: '2'
            }
            break;

        case ('9'):
            payload = {
                "~": topic,
                name: data.chi + '_' + data.dove,
                unique_id: data.chi + '_' + data.dove,
                state_topic: '~/state',
                off_delay: 1800,
                payload_on: '1',
                value_template: '1',
                device_class: 'motion'
            }
            break;
    }

    if (payload) {
        topic = topic + '/config';
        client.publish(topic, JSON.stringify(payload), {retain:true}, function() {
            console.log("topic - " + topic);
        });
    }
}

// mqtt publish topics
client.on('connect', function() { // When connected
    console.log('> connected');
    
    console.log("Connecting to MYHOME bridge " + config.myhome_config.host+":"+config.myhome_config.port);
    var mhengine = new myhome.engine(config.myhome_config);
    
	mhengine.layer1.on ('connected', function (data) {
        console.log('> connected');
        console.log('Sending updates for lights and shutters');
        // Lights and shutters diagnostic frame
        mhengine.sendCommand({command: "*#1*0##"});
    });
      
	mhengine.on ('packet', function (data) {
        var strData = data.toString();
		var msg = parsePacket(strData);
		if (msg && msg.chi in scs_mqtt) {

            // publish a message to a topic
            topic = config.mqtt_config.topic_prefix + '/' + scs_mqtt[msg.chi] + '/' + msg.dove;
            if (topic) {

                if (config.mqtt_config.discovery.toLowerCase() == 'true') {
                    // publish config at startup
                    var idx = msg.chi + '_' + msg.dove;
                    if (mqtt_published_cfg.indexOf(idx) < 0){
                        publish_cfg(topic);
                        mqtt_published_cfg.push(idx);
                    }
                }

                // publish state
                topic = topic + '/state';
                client.publish(topic, msg.cosa, {retain:true}, function() {
                    console.log("topic - " + topic + ': ' + msg.cosa);
                });
            }
		} 
	});

	// subscribe to a 'set' topic
    client.subscribe(config.mqtt_config.topic_prefix + '/+/+/set', function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            var msg = mqtt2scs(topic, message);
            if (msg) {
                var strMsg = '*' + msg.chi + '*' + msg.cosa + '*' + msg.dove +'##';
                console.log(strMsg);
                mhengine.sendCommand({command: strMsg});
            }
        });
    });

});
