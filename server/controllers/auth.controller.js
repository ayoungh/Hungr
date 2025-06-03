//CONTROLLER

//Dependencies 
var jwt = require('jsonwebtoken');
var moment = require('moment');
var bcrypt = require('bcryptjs');
var config = require('../config');

//MODEL
var User = require('../models/user.model'); //load in our user model


//Create JWT token using user id
module.exports.createToken = function createTokenfn(user) {
  return jwt.sign(
    { sub: user._id },
    config.tokenSecret,
    { expiresIn: '14d' }
  );
}



module.exports.getLogin  = function(req, res) {
    //check that the current user is logged in else return that the user needs to login
    //req.user
};

module.exports.postLogin = function(req, res, next) {

    //use passport to authenticate and check the login details
    next();

};

module.exports.getLogout = function(req, res) {

    //logout the user by clearing the users jwt token?


};

















//old:
if (false) {
    module.exports.login = function loginfn(req, res) {
        User.findOne({ email: req.body.email }, '+password', function(err, user) {
            if (!user) {
              return res.json({ message: { email: 'Incorrect email' } });
            }

            bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
                if (!isMatch) {
                    return res.json({ message: { password: 'Incorrect password' } });
                }

                user = user.toObject();
                delete user.password;

                var token = createToken(user);
                res.json({ token: token, user: user });
            });
        });
    };

    //check if the user is authenticated 
    module.exports.isAuthenticated = function isAuthenticatedfn(req, res, next) {
        console.log('isAuthenticated..');


      //check if no heders and no authorization
      if (!(req.headers && req.headers.authorization)) {
        console.log('no headers or no authorization');
        return res.json({ message: 'You did not provide a JSON Web Token in the Authorization header.' }); //status(400).send
      }
     
      var header = req.headers.authorization.split(' ');
      var token = header[1];
      var payload = jwt.decode(token, config.tokenSecret);
      var now = moment().unix();
     
      if (now && payload.exp) {
        console.log('now and payload.exp')
        return res.json({ message: 'Token has expired.' });
      }
     
      User.findById(payload.sub, function(err, user) {
        console.log('user: ', user)
        if (!user) {
          return res.json({ message: 'User no longer exists.' });
        }
     
        req.user = user;
        next();
      });
    };
}


