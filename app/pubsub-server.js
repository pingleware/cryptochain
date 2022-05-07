
const settings = require("config.json")("./settings.json");
const http = require("http");
const faye = require("faye");

var redis = http.createServer();
var bayeux = new faye.NodeAdapter({mount: '/', timeout: 45});


bayeux.on('subscribe', function(clientId, channel) {
    console.log('[  SUBSCRIBE] ' + clientId + ' -> ' + channel);
});
  
bayeux.on('unsubscribe', function(clientId, channel) {
    console.log('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
    return clientId;
});
  
bayeux.on('disconnect', function(clientId) {
    console.log('[ DISCONNECT] ' + clientId);
    return clientId;
});


function start() {
    bayeux.attach(redis);
    redis.listen(settings.pubsub_server_mainnet_port, function(){
        console.log(`PubSub Server listening on port ${settings.pubsub_server_mainnet_port}`);
    });
}

function stop() {
    redis.close(() => {
        console.log('PubSub Server has been stopped');
    })
}

module.exports = {
    start,
    stop
}