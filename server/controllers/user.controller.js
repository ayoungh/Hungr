//CONTROLLER

//Dependencies
var express = require('express');
var moment = require('moment');

//MODEL
var User = require('../models/user.model'); //load in our user model


//module.exports.loginUser









module.exports.getUsers = function (req, res) { //get all the users
	User.find(function(err, user) {
	    if (err)
	        res.send(err);

	    res.json(user);
	});
};

module.exports.postUser = function (req, res) { //post a user item
    var user = new User(); // create a new instance of the User model

    console.log('init user:', user);

    //check for an email and password
    var data = {};

    if (req.body.email && req.body.password) {

        //define each in our user
        user.email = req.body.email; // set the email for the user (comes from the request)
        //we use the method in the model to hash the password
        user.local.password = user.generateHash(req.body.password) // set the password for the user with obfuscation

        //check the email is valid before trying to save:
        if (!user.validEmail(req.body.email)) {
            data.error = 'Email address not valid!';
            res.json(data);
        } else {

            // save the user and check for errors
            user.save(function(err) {
                   
                if (err) {
                    console.log('ERROR:');
                    console.dir(err);
                    //on saving we are checking the users email is in db because we have added unique:true - see model
                    if (err.code) {
                        console.log('err.code found');
                        if (err.code === 11000) {
                            console.log('err.code === 11000');

                            data.error = 'Email address already found!' 
                            res.json(data);
                        }
                    }
                } else {
                    console.log('Save user')
                    data = { 
                            message: 'User created!',
                            email: user.email,
                            password: user.local.password
                        };
                    res.json(data);
                }
                
            });

        }

    } else {
        data.error = 'no email or password'  
        res.json(data);
    }

    
};

module.exports.getUser = function(req, res) { //get the individual user item by id
    User.findById(req.params.user_id, function(err, user) { //find the user model by id
        if (err)
        	res.send(err); //change this to give back an error in json
            //res.json({ message: 'Error, the food you are looking for may not exist' });
        res.json(user);
    });
};


module.exports.updateUser = function(req, res) { //update the individual user item by id
    User.findById(req.params.user_id, function(err, user) { //find the user model by id

        if (err)
            res.send(err);

        user.local.email = req.body.email;  // update the user item info
        user.local.password = user.generateHash(req.body.password) // set the password for the user with obfuscation
        //add an updated time using moment

        // save the food
        user.save(function(err) {
            if (err)
                res.send(err);

            res.json({ 
	                	message: 'User has been updated!',
	                	email: user.local.email,
	                	password: user.local.password
            		});
        });

    });
};


module.exports.deleteUser = function(req, res) { //delete the user by id
    User.remove({
        _id: req.params.user_id
    }, function(err, food) {
        if (err)
            res.send(err);

        res.json({ message: 'Successfully deleted user' });
    });
};
