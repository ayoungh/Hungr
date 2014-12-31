//Dependencies 
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var moment = require('moment');

//get configs
var config = require('./config');


//DB
mongoose.connect(config.db);

//set our app as express
var app = express();


//Tell our app to use middlewares
app.use( bodyParser.urlencoded({ extended: true }) );
app.use(bodyParser.json());





//ROUTES

//give a response at root
app.get('/', function (req, res) {
  res.json({ message:'Hungry World!'});
});


var router = express.Router(); //define our router 

//api root
router.route('/').get(function (req, res) {
  res.json({ message:'Api'});
});


router.route('/users').get(function (req, res) {
  res.json({ message:'users'});
});

router.route('/foods').get(function (req, res) {
  res.json({ message:'foods'});
});

router.route('/foods/:food_id').get(function (req, res) {
  res.json({ message:'foods', id: req.params.food_id});
});


//append /api onto all router routes 
app.use('/api', router);





//set the port to use from config file
app.set('port', config.port);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' Started: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
});