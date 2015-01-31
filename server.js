var express = require('express');
var app = express();
var net = require('net');
var WebSocketServer = require('ws').Server;

// HTTP SERVER
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    response.sendFile('index.html', {"root": __dirname});
});

app.get(/^(.+)$/, function(req, res){ 
    res.sendFile(req.params[0], {"root": __dirname}); 
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});


// This is for the Battlecode tick server.
// It relays messages from the battlecode socket
// to a websocket.
// The javscript in 'index.html' connects to the
// websocket and receives the relayed messages.
var WEBSOCKET_PORT = 1338;
var BATTLECODE_TICK_PORT = 1337;

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
        wss = null;
        wsconn = null;
    }
}


// connect to the battlecode socket
function connectToBattlecodeTick(){
    console.log('trying to connect to the battlecode tick server!');
    var client = net.connect({port: BATTLECODE_TICK_PORT},
        function() {
            console.log('connected to the battlecode tick server!');
            createWebSocket();
        });
    client.on('data', function(data) {
        //console.log('received from battlecode tick server: '+data.toString());
        if(wsconn)
            wsconn.send(data.toString());
    });
    client.on('end', function() {
        console.log('connection to the battlecode tick server was terminated');
        closeWebSocket();
        setTimeout(connectToBattlecodeTick,1000);
    });
    client.on('error',function(err){
        console.log('could not connect to the battlecode tick server on port: '+BATTLECODE_TICK_PORT);
        closeWebSocket();
        setTimeout(connectToBattlecodeTick,1000);
    });
}


var args = process.argv.slice(2);
console.log('Starting with arguments: '+args);
if(args.length>0 && args[0]=='tick')
    setTimeout(connectToBattlecodeTick,1000);
