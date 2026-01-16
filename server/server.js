//Dependencies
const express = require('express');
const logger = require('morgan');
//const jwt = require('jwt-simple');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');

const moment = require('moment');

//get configs
const config = require('./config');


//DB
console.log(`Connecting to MongoDB at ${config.db}`);
mongoose.connect(config.db)
  .then(() => {
    console.log('MongoDB connection established');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });


//set our app as express
const app = express();
//module.exports.app = app;


//Tell our app to use middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
  resave: true,
})); // session secret - get from config
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


const passportConfig = require('./passport'); //(passport); // pass passport for configuration


//ROUTES

app.get('/api/auth', (req, res) => {
  res.json({
    message: 'test get request',
  });
});

app.post('/api/auth', (req, res) => {
  const token = jwt.sign({
    username: 'username',
  }, config.tokenSecret);

  res.json({
    message: 'test post request',
    token,
  });
});


const router = express.Router(); //define our router
const routes = require('./routes/index')(app, router); // load our routes and pass in our app, passport (configured), Food model, User model


//set the port to use from config file
app.set('port', config.port);

//app.use(errorHandler());

app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')} - ${app.get('env')}`);
  console.log(`Started: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
});

// generic error handler to stop the server crashing on unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});



// UTIL FUNCTIONS

function authenticate(req, res, next) {
  const body = req.body;
  if (!body.username || !body.password) {
    res.status(400).end('Must provide username or password');
  } else if (body.username !== 'ayoungh' || body.password !== 'password') {
    res.status(401).end('Username or password incorrect');
  } else {
    next();
  }
}


