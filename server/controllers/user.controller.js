//CONTROLLER

//MODEL
var User = require('../models/user.model'); //load in our user model


//module.exports.loginUser









module.exports.getUsers = async function (req, res) { //get all the users
	try {
	    const user = await User.find().select('email username');
	    res.json({ data: user });
	} catch (err) {
	    res.status(500).json({ error: 'Failed to fetch users', details: err.message || err });
	}
};

module.exports.postUser = async function (req, res) { //post a user item
    var user = new User(); // create a new instance of the User model

    console.log('init user:', user);

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!user.validEmail(email)) {
        return res.status(400).json({ error: 'Email address not valid!' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    //define each in our user
    user.email = email; // set the email for the user (comes from the request)
    user.username = email.toLowerCase();
    //we use the method in the model to hash the password
    user.local.password = user.generateHash(password); // set the password for the user with obfuscation

    // save the user and check for errors
    try {
        await user.save();
        console.log('Save user');
        return res.json({
            message: 'User created!',
            email: user.email
        });
    } catch (err) {
        console.log('ERROR:');
        console.dir(err);
        //on saving we are checking the users email is in db because we have added unique:true - see model
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Email address already found!' });
        }
        return res.status(500).json({ error: 'Error saving user', details: err.message || err });
    }
};

module.exports.getUser = async function(req, res) { //get the individual user item by id
    try {
        const user = await User.findById(req.params.user_id).select('email username'); //find the user model by id
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ data: user });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch user', details: err.message || err });
    }
};


module.exports.updateUser = async function(req, res) { //update the individual user item by id
    try {
        const user = await User.findById(req.params.user_id); //find the user model by id

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.body.email) {
            if (!user.validEmail(req.body.email)) {
                return res.status(400).json({ error: 'Email address not valid!' });
            }
            user.email = req.body.email;
            user.username = req.body.email.toLowerCase();
        }
        if (req.body.password) {
            if (req.body.password.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters.' });
            }
            user.local.password = user.generateHash(req.body.password); // set the password for the user with obfuscation
        }

        // save the food
        await user.save();

        res.json({
            message: 'User has been updated!',
            email: user.email,
            username: user.username
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update user', details: err.message || err });
    }
};


module.exports.deleteUser = async function(req, res) { //delete the user by id
  try {
    await User.findByIdAndDelete(req.params.user_id);
    res.json({ message: 'Successfully deleted user' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user', details: err.message || err });
  }
};
