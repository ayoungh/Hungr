//ROUTES

//Dependencies
var express = require('express');
var moment = require('moment');
var Food = require('../models/food.model'); //load in our food model

//FOODS	
console.log('Food Route');

var router = express.Router(); //define our router 

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
