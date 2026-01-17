/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *   - name: Users
 *     description: User management
 *   - name: Foods
 *     description: Food items
 *   - name: Status
 *     description: API status endpoints
 */
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

    /**
     * @openapi
     * /api/login:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Log in and receive a JWT
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 example: you@example.com
     *               password:
     *                 type: string
     *                 example: secret
     *     responses:
     *       200:
     *         description: Login success
     *       400:
     *         description: Validation error
     *       401:
     *         description: Invalid credentials
     */
    router.route('/login')
        .get(AuthCtrl.getLogin) //check login is valid
        .post(AuthCtrl.postLogin); //login

    router.route('/logout')
        .get(AuthCtrl.getLogout) //invalidate jwt token    




    //if admin maybe would use these? friends maybe? followers    

    /**
     * @openapi
     * /api/users:
     *   get:
     *     tags:
     *       - Users
     *     summary: List users
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of users
     *       401:
     *         description: Unauthorized
     *   post:
     *     tags:
     *       - Users
     *     summary: Register a user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 example: you@example.com
     *               password:
     *                 type: string
     *                 example: secret123
     *     responses:
     *       200:
     *         description: User created
     *       400:
     *         description: Validation error
     */
    router.route('/users')
        .get(AuthCtrl.requireAuth, UserCtrl.getUsers)
        .post(UserCtrl.postUser);


    /**
     * @openapi
     * /api/users/{user_id}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get a user by id
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User details
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     *   put:
     *     tags:
     *       - Users
     *     summary: Update a user
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: User updated
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     *   delete:
     *     tags:
     *       - Users
     *     summary: Delete a user
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: user_id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: User deleted
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    router.route('/users/:user_id')
        .get(AuthCtrl.requireAuth, UserCtrl.getUser)
        .put(AuthCtrl.requireAuth, UserCtrl.updateUser)
        .delete(AuthCtrl.requireAuth, UserCtrl.deleteUser);





    //FOODS

    // Create endpoint handlers for /foods
    /**
     * @openapi
     * /api/foods:
     *   get:
     *     tags:
     *       - Foods
     *     summary: List foods
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of foods
     *       401:
     *         description: Unauthorized
     *   post:
     *     tags:
     *       - Foods
     *     summary: Create a food
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *                 example: Tacos
     *               image:
     *                 type: string
     *                 example: https://example.com/tacos.jpg
     *     responses:
     *       200:
     *         description: Food created
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     */
    router.route('/foods')
      .post(AuthCtrl.requireAuth, FoodCtrl.postFood) //post a new food
      .get(AuthCtrl.requireAuth, FoodCtrl.getFoods); //get all foods

    /**
     * @openapi
     * /api/foods/{food_id}:
     *   get:
     *     tags:
     *       - Foods
     *     summary: Get a food by id
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: food_id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Food details
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Food not found
     *   put:
     *     tags:
     *       - Foods
     *     summary: Update a food
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: food_id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               image:
     *                 type: string
     *     responses:
     *       200:
     *         description: Food updated
     *       400:
     *         description: Validation error
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Food not found
     *   delete:
     *     tags:
     *       - Foods
     *     summary: Delete a food
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: food_id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Food deleted
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Food not found
     */
    router.route('/foods/:food_id')
      .get(AuthCtrl.requireAuth, FoodCtrl.getFood) //get food item
      .put(AuthCtrl.requireAuth, FoodCtrl.updateFood) //update a food item
      .delete(AuthCtrl.requireAuth, FoodCtrl.deleteFood); //delete food item





    /**
     * @openapi
     * /api:
     *   get:
     *     tags:
     *       - Status
     *     summary: API root status
     *     responses:
     *       200:
     *         description: API status
     */
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

