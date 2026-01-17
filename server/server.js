//Dependencies
const express = require('express');
const logger = require('morgan');
//const jwt = require('jwt-simple');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const isTestEnv = process.env.NODE_ENV === 'test';
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const moment = require('moment');

//get configs
const config = require('./config');


//set our app as express
const app = express();
//module.exports.app = app;

//DB
let mongoStatus = 'disconnected';

if (isTestEnv) {
  mongoose.set('bufferCommands', false);
}

console.log(`Connecting to MongoDB at ${config.db}`);
mongoose.connect(config.db)
  .then(() => {
    mongoStatus = 'connected';
    app.set('mongoStatus', mongoStatus);
    console.log('MongoDB connection established');
  })
  .catch((err) => {
    mongoStatus = 'error';
    app.set('mongoStatus', mongoStatus);
    console.error('MongoDB connection error:', err.message);
  });

mongoose.connection.on('error', (err) => {
  mongoStatus = 'error';
  app.set('mongoStatus', mongoStatus);
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  mongoStatus = 'disconnected';
  app.set('mongoStatus', mongoStatus);
  console.warn('MongoDB connection disconnected');
});

mongoose.connection.on('connected', () => {
  mongoStatus = 'connected';
  app.set('mongoStatus', mongoStatus);
  console.log('MongoDB connection established');
});

app.set('mongoStatus', mongoStatus);


//Tell our app to use middlewares
app.use(helmet());
app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

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


// required for passport
app.use(session({
  secret: config.sessionSecret,
  saveUninitialized: true,
  resave: true,
})); // session secret - get from config
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


const passportConfig = require('./passport'); //(passport); // pass passport for configuration


const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hungr API',
      version: '1.0.0',
      description: 'API for the Hungr food sharing app',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./server/routes/*.js', './server/server.js'],
});


//ROUTES

/**
 * @openapi
 * /api/auth:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Test auth GET endpoint
 *     responses:
 *       200:
 *         description: Auth GET response
 *   post:
 *     tags:
 *       - Auth
 *     summary: Test auth POST endpoint
 *     responses:
 *       200:
 *         description: Auth POST response with token
 */
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

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

/**
 * @openapi
 * /healthz:
 *   get:
 *     tags:
 *       - Status
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Health status
 */
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    mongoStatus: app.get('mongoStatus') || 'unknown'
  });
});


const router = express.Router(); //define our router
const routes = require('./routes/index')(app, router, authLimiter); // load our routes and pass in our app, passport (configured), Food model, User model


//set the port to use from config file
app.set('port', config.port);

//app.use(errorHandler());

let server;

if (require.main === module) {
  server = app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')} - ${app.get('env')}`);
    console.log(`MongoDB status: ${mongoStatus}`);
    console.log(`Started: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
  });
}

// generic error handler to stop the server crashing on unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({
    error: 'Internal Server Error',
    details: err.message || err
  });
});

module.exports = app;



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


