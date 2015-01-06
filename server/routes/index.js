//ROUTE

//Get express
var express = require('express');
var moment = require('moment');

//passing in app, passport and models
module.exports = function(app, passport, Food, User) {

	//give a response at root
	app.get('/', function (req, res) {
	  res.json({ message:'Hungry World!'});
	});


	var router = express.Router(); //define our router 

	// middleware to use for all requests
	router.use(function(req, res, next) {
	    console.log('router in use...');
	    next(); // make sure we go to the next routes and don't stop here
	});

	//api root
	router.route('/').get(function (req, res) {
	  res.json({ message:'Api'});
	});
  

	//user profile
	router.route('/profile').get(isLoggedIn, function(req, res) {
        res.json({
            user : req.user // get the user out of session and pass to template
        });
    });


	//USERS

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

	        console.log(user);

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




	//FOODS	

	router.route('/foods') //http://localhost:PORT/api/foods
	    .get(function(req, res) { //get all the food items
	        Food.find(function(err, food) {
	            if (err)
	                res.send(err);

	            res.json(food);
	        });
	    })
		.post(function (req, res) { //post a food item
	        var food = new Food(); // create a new instance of the Food model
	        food.name = req.body.name; // set the food name (comes from the request)
	        food.image = req.body.image; //
	        food.dateCreated = moment().unix();
	        food.dateModified = moment().unix();

	        console.log(moment().unix());

	        // save the food and check for errors
	        food.save(function(err) {
	            if (err)
	                res.send(err);

	            res.json({ 
	            			message: 'Food created!',
		                	raw: food
		                });
	        });
		});

	router.route('/foods/:food_id') //http://localhost:PORT/api/foods/:food_id
		.get(function(req, res) { //get the individual food item by id
	        Food.findById(req.params.food_id, function(err, food) { //find the food model by id
	            if (err)
	            	res.send(err); //change this to give back an error in json
	                //res.json({ message: 'Error, the food you are looking for may not exist' });
	            res.json(food);
	        });
	    })
	    .put(function(req, res) { //update the individual food item by id
	        Food.findById(req.params.food_id, function(err, food) { //find the food model by id

	            if (err)
	                res.send(err);

	            food.name = req.body.name;  // update the food item info
	            food.image = req.body.image; //
	            //add an updated time using moment
	            food.dateModified = moment().unix();

	            // save the food
	            food.save(function(err) {
	                if (err)
	                    res.send(err);

	                res.json({ 
			                	message: 'Food has been updated!',
			                	raw: food
	                		});
	            });

	        });
	    })
	    .delete(function(req, res) { //delete teh food by id
	        Food.remove({
	            _id: req.params.food_id
	        }, function(err, food) {
	            if (err)
	                res.send(err);

	            res.json({ message: 'Successfully deleted food item' });
	        });
	    });


	//append /api onto all router routes 
	app.use('/api', router);




};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	console.log(req.isAuthenticated());

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't then provide an error 
    res.json({ error: 'User is not logged in, please login.' });
}

