//Dependencies 
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var moment = require('moment');

//get configs
var config = require('./config');


//DB
mongoose.connect(config.db);

//set our app as express
var app = express();


//Tell our app to use middlewares
app.use( bodyParser.urlencoded({ extended: true }) );
app.use(bodyParser.json());



//MODELS
var Food = require('./models/food');



//ROUTES

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


router.route('/users').get(function (req, res) {
  res.json({ message:'users'});
});

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

        // save the food and check for errors
        food.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Food created!' });
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
            //add an updated time using moment

            // save the food
            food.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Food has been updated!' });
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





//set the port to use from config file
app.set('port', config.port);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' Started: ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
});