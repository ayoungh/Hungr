//CONTROLLER

//Dependencies 
var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config');

//Create JWT token using user id
module.exports.createToken = function createTokenfn(user) {
  var payload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    sub: user._id
  };
 
  return jwt.encode(payload, config.tokenSecret);
}




//check if the user is authenticated 
module.exports.isAuthenticated = function isAuthenticatedfn(req, res, next) {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).send({ message: 'You did not provide a JSON Web Token in the Authorization header.' });
  }
 
  var header = req.headers.authorization.split(' ');
  var token = header[1];
  var payload = jwt.decode(token, config.tokenSecret);
  var now = moment().unix();
 
  if (now && payload.exp) {
    return res.status(401).send({ message: 'Token has expired.' });
  }
 
  User.findById(payload.sub, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User no longer exists.' });
    }
 
    req.user = user;
    next();
  })
}



