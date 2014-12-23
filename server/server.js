var express = require('express');
var moment = require('moment');

//get configs
var config = require('./config');


//set our app as express
var app = express();


//give a response at root
app.get('/', function (req, res) {
  res.send('Hungry World!');
})





//set the port to use from config file
app.set('port', config.port);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});