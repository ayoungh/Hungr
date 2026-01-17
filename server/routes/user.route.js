//ROUTES

//Dependencies
var express = require('express');
var moment = require('moment');
var User = require('../models/user.model'); //load in our user model


//USERS
console.log('Users Route');


var router = express.Router(); //define our router 

router.route('/users') //http://localhost:PORT/api/users
    .get(isLoggedIn, async function(req, res) { //get all the users
        try {
            const user = await User.find();
            res.json(user);
        } catch (err) {
            res.send(err);
        }
    })
	.post(async function (req, res) { //post a user item
        var user = new User(); // create a new instance of the User model

        console.log('user is :', user);

        user.local.email = req.body.email; // set the email for the user (comes from the request)
        user.local.password = user.generateHash(req.body.password); // set the password for the user with obfuscation

        // save the user and check for errors
        try {
            await user.save();
            res.json({
                message: 'User created!',
                email: user.local.email,
                password: user.local.password
            });
        } catch (err) {
            var errorMsg = err;
            res.json({
                error: errorMsg
            });

            //on saving we are checking the users email is in db because we have added unique:true - see model
            if (err.code === 11000) {
                res.json({
                    error: 'Email address already found!'
                });
            }
        }
	});




router.route('/users/:user_id') //http://localhost:PORT/api/users/:user_id
	.get(async function(req, res) { //get the individual user item by id
        try {
            const user = await User.findById(req.params.user_id); //find the user model by id
            res.json(user);
        } catch (err) {
            res.send(err); //change this to give back an error in json
        }
    })
    .put(async function(req, res) { //update the individual user item by id
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
            res.send(err);
        }
    })
    .delete(async function(req, res) { //delete the user by id
        try {
            await User.findByIdAndDelete(req.params.user_id);
            res.json({ message: 'Successfully deleted user' });
        } catch (err) {
            return res.send(err);
        }
    });







