//CONTROLLER

//Dependencies
var express = require('express');
var moment = require('moment');

//MODEL
var User = require('../models/user.model'); //load in our user model


//module.exports.loginUser









module.exports.getUsers = async function (req, res) { //get all the users
	try {
	    const user = await User.find();
	    res.json(user);
	} catch (err) {
	    res.send(err);
	}
};

module.exports.postUser = async function (req, res) { //post a user item
    var user = new User(); // create a new instance of the User model

    console.log('init user:', user);

    //check for an email and password
    var data = {};

    if (req.body.email && req.body.password) {

        //define each in our user
        user.email = req.body.email; // set the email for the user (comes from the request)
        //we use the method in the model to hash the password
        user.local.password = user.generateHash(req.body.password); // set the password for the user with obfuscation

        //check the email is valid before trying to save:
        if (!user.validEmail(req.body.email)) {
            data.error = 'Email address not valid!';
            return res.json(data);
        }

        // save the user and check for errors
        try {
            await user.save();
            console.log('Save user');
            data = {
                message: 'User created!',
                email: user.email,
                password: user.local.password
            };
            return res.json(data);
        } catch (err) {
            console.log('ERROR:');
            console.dir(err);
            //on saving we are checking the users email is in db because we have added unique:true - see model
            if (err.code === 11000) {
                data.error = 'Email address already found!';
                return res.json(data);
            }
            return res.status(500).json({ error: 'Error saving user', raw: err });
        }
    }

    data.error = 'no email or password';
    return res.json(data);
};

module.exports.getUser = async function(req, res) { //get the individual user item by id
    try {
        const user = await User.findById(req.params.user_id); //find the user model by id
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        return res.send(err); //change this to give back an error in json
    }
};


module.exports.updateUser = async function(req, res) { //update the individual user item by id
    try {
        const user = await User.findById(req.params.user_id); //find the user model by id

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.local.email = req.body.email;  // update the user item info
        user.local.password = user.generateHash(req.body.password); // set the password for the user with obfuscation
        //add an updated time using moment

        // save the food
        await user.save();

        res.json({
            message: 'User has been updated!',
            email: user.local.email,
            password: user.local.password
        });
    } catch (err) {
        return res.send(err);
    }
};


module.exports.deleteUser = async function(req, res) { //delete the user by id
  try {
    await User.findByIdAndDelete(req.params.user_id);
    res.json({ message: 'Successfully deleted user' });
  } catch (err) {
    return res.send(err);
  }
};
