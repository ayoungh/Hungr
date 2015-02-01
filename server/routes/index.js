//ROUTE

//Get express
var express = require('express');
var moment = require('moment');

//CONTROLLERS
//var auth = require('./controllers/auth');
var FoodCtrl = require('../controllers/food.controller');
var UserCtrl = require('../controllers/user.controller');


module.exports = function(app, router) {

    // middleware to use for all requests
    router.use(function(req, res, next) {
        console.log('router in use...');
        next(); // make sure we go to the next routes and don't stop here
    });

    //give a response at root
    app.get('/', function (req, res) {
      res.json({ message:'Hungry World!'});
    });


    //FOODS

    // Create endpoint handlers for /foods
    router.route('/foods')
      .post(FoodCtrl.postFood)
      .get(FoodCtrl.getFoods);

    //Create endpoint handlers for /foods/:food_id
    router.route('/foods/:food_id')
      .get(FoodCtrl.getFood)
      .put(FoodCtrl.updateFood)
      .delete(FoodCtrl.deleteFood);


    //USERS
    router.route('/users')	
    	.get(UserCtrl.getUsers)
    	.post(UserCtrl.postUser);


    router.route('/users/:user_id')
    	.get(UserCtrl.getUser)	
    	.put(UserCtrl.updateUser)
    	.delete(UserCtrl.deleteUser);



    //api root
    router.route('/').get(function (req, res) {
      res.json({ message:'Api'});
    });
      

    //user profile
    // router.route('/profile').get(isLoggedIn, function(req, res) {
    //    res.json({
    //        user : req.user // get the user out of session and pass to template
    //    });
    // });


    //append /api onto all router routes 
    app.use('/api', router);

};

// route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {

// 	console.log(req.isAuthenticated());

//     // if user is authenticated in the session, carry on 
//     if (req.isAuthenticated())
//         return next();

//     // if they aren't then provide an error 
//     res.json({ error: 'User is not logged in, please login.' });
// }

