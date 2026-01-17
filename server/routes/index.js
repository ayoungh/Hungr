//ROUTE

//Get express
var express = require('express');
var moment = require('moment');

//CONTROLLERS
//var auth = require('./controllers/auth');
var AuthCtrl = require('../controllers/auth.controller');
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

    //USERS

    router.route('/login')
        .get(AuthCtrl.getLogin) //check login is valid
        .post(AuthCtrl.postLogin); //login

    router.route('/logout')
        .get(AuthCtrl.getLogout) //invalidate jwt token    




    //if admin maybe would use these? friends maybe? followers    

    router.route('/users')
        .get(AuthCtrl.requireAuth, UserCtrl.getUsers)
        .post(UserCtrl.postUser);


    router.route('/users/:user_id')
        .get(AuthCtrl.requireAuth, UserCtrl.getUser)
        .put(AuthCtrl.requireAuth, UserCtrl.updateUser)
        .delete(AuthCtrl.requireAuth, UserCtrl.deleteUser);





    //FOODS

    // Create endpoint handlers for /foods
    router.route('/foods')
      .post(AuthCtrl.requireAuth, FoodCtrl.postFood) //post a new food
      .get(AuthCtrl.requireAuth, FoodCtrl.getFoods); //get all foods

    //Create endpoint handlers for /foods/:food_id
    router.route('/foods/:food_id')
      .get(AuthCtrl.requireAuth, FoodCtrl.getFood) //get food item
      .put(AuthCtrl.requireAuth, FoodCtrl.updateFood) //update a food item
      .delete(AuthCtrl.requireAuth, FoodCtrl.deleteFood); //delete food item





    //api root
    router.route('/').get(function (req, res) {
      res.json({ message:'Api'});
    });
      



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

