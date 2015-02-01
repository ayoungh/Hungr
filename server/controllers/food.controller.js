//CONTROLLER

//Dependencies
var User = require('../models/user.model'); //load in our user model
var moment = require('moment');

//MODEL
var Food = require('../models/food.model'); //load in our food model




//export methods

module.exports.getFoods = function(req, res) { //get all the food items
    Food.find(function(err, food) {
        if (err)
            res.send(err);

        res.json(food);
    });
}


module.exports.postFood = function (req, res) { //post a food item
    var food = new Food(); // create a new instance of the Food model
    food.name = req.body.name; // set the food name (comes from the request)
    food.image = req.body.image; //
    food.dateCreated = moment().unix();
    food.dateModified = moment().unix();

    console.log('moment unix: ', moment().unix());

    // save the food and check for errors
    food.save(function(err) {
        if (err) {
        	console.log('food save error')
            //res.send(err);
        	var data = {
        		error: 'Error saving food',
        		raw: err
        	}
        } else {		
            var data = { 
    			message: 'Food created!',
            	raw: food
            }	
        }	


        res.json(data);
    });
};


module.exports.getFood = function(req, res) { //get the individual food item by id
    console.log('food_id: ', req.params.food_id)
    Food.findById(req.params.food_id, function(err, food) { //find the food model by id
        if (err)
        	res.send(err); //change this to give back an error in json
            //res.json({ message: 'Error, the food you are looking for may not exist' });
        res.json(food);
    });
};


module.exports.updateFood = function(req, res) { //update the individual food item by id
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
};

module.exports.deleteFood = function(req, res) { //delete the food by id
	Food.remove({
	    _id: req.params.food_id
	}, function(err, food) {
	    if (err)
	        res.send(err);

	    res.json({ message: 'Successfully deleted food item' });
	});
};






