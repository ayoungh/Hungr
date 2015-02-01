//ROUTES

//Dependencies
var express = require('express');
var moment = require('moment');
var User = require('../models/user.model'); //load in our user model


//USERS
console.log('Users Route');


var router = express.Router(); //define our router 

router.route('/users') //http://localhost:PORT/api/users
    .get(isLoggedIn, function(req, res) { //get all the users
        User.find(function(err, user) {
            if (err)
                res.send(err);

            res.json(user);
        });
    })
	.post(function (req, res) { //post a user item
        var user = new User(); // create a new instance of the User model

        console.log('user is :', user);

        user.local.email = req.body.email; // set the email for the user (comes from the request)
        user.local.password = user.generateHash(req.body.password) // set the password for the user with obfuscation



        // save the user and check for errors
        user.save(function(err) {
            if (err)
                //res.send(err);

            	var errorMsg = err;
            	res.json({
    				error: errorMsg
        		});

	            //on saving we are checking the users email is in db because we have added unique:true - see model
	            if (err.code === 11000)
            		res.json({
        				error: 'Email address already found!' 
            		});

            res.json({ 
            			message: 'User created!',
            			email: user.local.email,
	                	password: user.local.password
	                });
        });
	});



router.route('/users/:user_id') //http://localhost:PORT/api/users/:user_id
	.get(function(req, res) { //get the individual user item by id
        User.findById(req.params.user_id, function(err, user) { //find the user model by id
            if (err)
            	res.send(err); //change this to give back an error in json
                //res.json({ message: 'Error, the food you are looking for may not exist' });
            res.json(user);
        });
    })
    .put(function(req, res) { //update the individual user item by id
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
    })
    .delete(function(req, res) { //delete the user by id
        User.remove({
            _id: req.params.user_id
        }, function(err, food) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted user' });
        });
    });







