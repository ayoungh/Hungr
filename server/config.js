//CONFIG
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

const tokenSecret = process.env.TOKEN_SECRET || process.env.tokenSecret || 'alwayshungry';
const sessionSecret = process.env.SESSION_SECRET || process.env.sessionSecret || 'alwayshungry';

if (process.env.NODE_ENV === 'production') {
  if (tokenSecret === 'alwayshungry' || sessionSecret === 'alwayshungry') {
    throw new Error('TOKEN_SECRET and SESSION_SECRET must be set in production.');
  }
}

module.exports = {
  db: process.env.DB || process.env.db || 'mongodb://localhost:27017/hungrdb',
  port: process.env.PORT || process.env.port || 3000,
  apiLogging: String(process.env.API_LOGGING || '').toLowerCase() === 'true',
  sessionSecret: sessionSecret, //not sure this is needed now?
  tokenSecret: tokenSecret
};
