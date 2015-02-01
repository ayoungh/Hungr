//Dependencies 
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');



var moment = require('moment');

//get configs
var config = require('./config');


//DB
mongoose.connect(config.db);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB: connection error:'));
db.once('open', function (callback) {
  // yay!
  console.log('DB: connection open');
});


//set our app as express
var app = express();
//module.exports.app = app;


//Tell our app to use middlewares
app.use(logger('dev'));
app.use( bodyParser.urlencoded({ extended: true }) );
app.use(bodyParser.json());
app.use(cookieParser());

// required for passport
app.use(session({
					secret: config.sessionSecret, 
                	saveUninitialized: true,
                	resave: true 
                })); // session secret - get from config
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


var passportConfig = require('./passport');//(passport); // pass passport for configuration


//ROUTES
var router = express.Router(); //define our router 
var routes = require('./routes/index')(app, router); // load our routes and pass in our app, passport (configured), Food model, User model


//set the port to use from config file
app.set('port', config.port);

//app.use(errorHandler());

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' - ' + app.get('env'));
  console.log('Started: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
});



