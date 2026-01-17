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
let mongoStatus = 'disconnected';

console.log(`Connecting to MongoDB at ${config.db}`);
mongoose.connect(config.db)
  .then(() => {
    mongoStatus = 'connected';
    console.log('MongoDB connection established');
  })
  .catch((err) => {
    mongoStatus = 'error';
    console.error('MongoDB connection error:', err.message);
  });

mongoose.connection.on('error', (err) => {
  mongoStatus = 'error';
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  mongoStatus = 'disconnected';
  console.warn('MongoDB connection disconnected');
});

mongoose.connection.on('connected', () => {
  mongoStatus = 'connected';
  console.log('MongoDB connection established');
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

if (config.apiLogging) {
  app.use((req, res, next) => {
    console.log(`[api] ${req.method} ${req.originalUrl}`);
    if (Object.keys(req.query || {}).length) {
      console.log('[api] query:', req.query);
    }
    if (Object.keys(req.body || {}).length) {
      console.log('[api] body:', req.body);
    }
    next();
  });
}
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
  console.log(`MongoDB status: ${mongoStatus}`);
  console.log(`Started: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
});

// generic error handler to stop the server crashing on unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (config.apiLogging) {
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err.message || err
    });
  }
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


