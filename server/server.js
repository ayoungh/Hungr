//Dependencies 
var express = require('express');
var logger = require('morgan');
//var jwt = require('jwt-simple');
var jwt = require('jsonwebtoken');
var { expressjwt: jwtMiddleware } = require('express-jwt');
var cors = require('cors');
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
app.use(cors());
app.use(logger('dev'));
app.use( bodyParser.urlencoded({ extended: true }) );
app.use(bodyParser.json());
app.use(cookieParser());
//config expressJWT
app.use(
  jwtMiddleware({ secret: config.tokenSecret, algorithms: ['HS256'] }).unless({
    path: ['/api/auth'],
  })
);

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

app.get('/api/auth', function (req, res) {

  res.json({
    'message':'test get request'
  });

});

app.post('/api/auth', function (req, res) {

  var token = jwt.sign({
    username: 'username'
  }, config.tokenSecret);

  res.json({
    'message':'test post request'
    ,'token': token
  });

});


var router = express.Router(); //define our router 
var routes = require('./routes/index')(app, router); // load our routes and pass in our app, passport (configured), Food model, User model


//set the port to use from config file
app.set('port', config.port);

//app.use(errorHandler());

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' - ' + app.get('env'));
  console.log('Started: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
});

// generic error handler to stop the server crashing on unhandled errors
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});



// UTIL FUNCTIONS

function authenticate(req, res, next) {
  var body = req.body;
  if (!body.username || !body.password) {
    res.status(400).end('Must provide username or password');
  } else if (body.username !== 'ayoungh' || body.password !== 'password') {
    res.status(401).end('Username or password incorrect');
  } else {
    next();
  }
}



