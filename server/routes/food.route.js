//ROUTES

//Dependencies
var express = require('express');
var moment = require('moment');
var Food = require('../models/food.model'); //load in our food model

//FOODS	
console.log('Food Route');

var router = express.Router(); //define our router 

router.route('/foods') //http://localhost:PORT/api/foods
    .get(async function(req, res) { //get all the food items
        try {
            const food = await Food.find();
            res.json(food || []);
        } catch (err) {
            res.send(err);
        }
    })
	.post(async function (req, res) { //post a food item
        var food = new Food(); // create a new instance of the Food model
        food.name = req.body.name; // set the food name (comes from the request)
        food.image = req.body.image; //
        food.dateCreated = moment().unix();
        food.dateModified = moment().unix();

        console.log('moment unix: ', moment().unix());

        // save the food and check for errors
        try {
            await food.save();
            var data = {
                message: 'Food created!',
                raw: food
            };
            res.json(data);
        } catch (err) {
            console.log('food save error');
            var data = {
                error: 'Error saving food',
                raw: err
            };
            res.json(data);
        }
	});

router.route('/foods/:food_id') //http://localhost:PORT/api/foods/:food_id
	.get(async function(req, res) { //get the individual food item by id
        try {
            const food = await Food.findById(req.params.food_id); //find the food model by id
            res.json(food);
        } catch (err) {
            res.send(err); //change this to give back an error in json
        }
    })
    .put(async function(req, res) { //update the individual food item by id
        try {
            const food = await Food.findById(req.params.food_id); //find the food model by id

            if (!food) {
                return res.status(404).json({ message: 'Food item not found' });
            }

            food.name = req.body.name;  // update the food item info
            food.image = req.body.image; //
            //add an updated time using moment
            food.dateModified = moment().unix();

            // save the food
            await food.save();

            res.json({
                message: 'Food has been updated!',
                raw: food
            });
        } catch (err) {
            res.send(err);
        }
    })
    .delete(async function(req, res) { //delete teh food by id
        try {
            await Food.findByIdAndDelete(req.params.food_id);
            res.json({ message: 'Successfully deleted food item' });
        } catch (err) {
            return res.send(err);
        }
    });
