//CONTROLLER

//Dependencies 
var jwt = require('jsonwebtoken');
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
};

module.exports.requireAuth = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization header must be Bearer token.' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.tokenSecret);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};




module.exports.getLogin = function(req, res) {
  res.status(405).json({ error: 'Use POST /api/login to authenticate.' });
};

module.exports.postLogin = async function(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (!user.local || !user.local.password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isValid = user.validPassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = module.exports.createToken(user);
    res.json({
      token: token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.', details: err.message || err });
  }
};

module.exports.getLogout = function(req, res) {
  res.status(200).json({ message: 'Logged out.' });
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
     
      User.findById(payload.sub).then(function(user) {
        console.log('user: ', user);
        if (!user) {
          return res.json({ message: 'User no longer exists.' });
        }
     
        req.user = user;
        next();
      }).catch(function(err) {
        return res.json({ message: 'User lookup failed.', raw: err });
      });
    };
}


