module.exports = {
  db: process.env.db || 'localhost:27017/hungrdb',
  port: process.env.port || 3000,
  sessionSecret: 'alwayshungry'
};