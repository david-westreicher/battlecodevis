var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    response.sendFile('index.html', {"root": __dirname});
});

app.get(/^(.+)$/, function(req, res){ 
    console.log(req.params[0]);
    res.sendFile(req.params[0], {"root": __dirname}); 
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'));
});
