var net = require('net');
var WebSocketServer = require('ws').Server;

var BATTLECODE_TICK_PORT = 1337;
var WEBSOCKET_PORT = 1338;

// make a local websocketserver
var wss = null;
var wsconn = null;
function createWebSocket(){
    console.log('creating web socket');
    wss = new WebSocketServer({port: WEBSOCKET_PORT});
    wss.on('connection', function connection(ws) {
        console.log("somebody connected to our websocket :D");
        wsconn = ws;
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });
    });
}
// close the websocket
function closeWebSocket(){
    if(wss){
        console.log('closing websocket');
        wss.close();
    }
}


// connect to the local socket
var client = net.connect({port: BATTLECODE_TICK_PORT},
    function() {
        console.log('connected to the battlecode tick server!');
        createWebSocket();
    });
client.on('data', function(data) {
    console.log('received from battlecode tick server: '+data.toString());
    if(wsconn)
        wsconn.send(data.toString());
});
client.on('end', function() {
    console.log('connection to the battlecode tick server was terminated');
    closeWebSocket();
});
client.on('error',function(err){
    console.log('could not connect to the battlecode tick server on port: '+BATTLECODE_TICK_PORT);
    closeWebSocket();
});


