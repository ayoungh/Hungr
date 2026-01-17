//CONFIG
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

module.exports = {
  db: process.env.DB || process.env.db || 'mongodb://localhost:27017/hungrdb',
  port: process.env.PORT || process.env.port || 3000,
  apiLogging: String(process.env.API_LOGGING || '').toLowerCase() === 'true',
  sessionSecret: 'alwayshungry', //not sure this is needed now?
  tokenSecret: 'alwayshungry'
};
