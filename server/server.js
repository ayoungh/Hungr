//Dependencies 
var express = require('express');
var jwt = require('jwt-simple');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

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


//Tell our app to use middlewares
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
app.use(flash()); // use connect-flash for flash messages stored in session

var passportConfig = require('./passport')(passport); // pass passport for configuration


//MODELS
var Food = require('./models/food.model'); //load in our food model
var User = require('./models/user.model'); //load in our user model

//ROUTES
var routes = require('./routes/index.js')(app, passport, Food, User); // load our routes and pass in our app, passport (configured), Food model, User model



//set the port to use from config file
app.set('port', config.port);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' Started: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
});