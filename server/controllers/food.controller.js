//CONTROLLER

//MODEL
var Food = require('../models/food.model'); //load in our food model




//export methods

module.exports.getFoods = async function(req, res) { //get all the food items
  try {
    const food = await Food.find();
    // return an empty array rather than undefined when no items exist
    res.json({ data: food || [] });
  } catch (err) {
    console.error('getFoods error:', err);
    return res.status(500).json({ error: 'Failed to fetch foods', details: err.message || err });
  }
};

module.exports.getFood = async function(req, res) { //get the individual food item by id
  console.log('food_id: ', req.params.food_id);
  try {
    const food = await Food.findById(req.params.food_id); //find the food model by id
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ data: food });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch food', details: err.message || err });
  }
};


module.exports.postFood = async function (req, res) { //post a food item
  if (!req.body.name) {
    return res.status(400).json({ error: 'Food name is required' });
  }

   const food = new Food(); // create a new instance of the Food model
   food.name = req.body.name; // set the food name (comes from the request)
   food.image = req.body.image;


  // save the food and check for errors
  try {
    await food.save();
    res.json({
      message: 'Food created!',
      data: food
    });
  } catch (err) {
    console.log('food save error');
    return res.status(500).json({
      error: 'Error saving food',
      details: err.message || err
    });
  }
};




module.exports.updateFood = async function(req, res) { //update the individual food item by id
    try {
        const food = await Food.findById(req.params.food_id); //find the food model by id
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        if (req.body.name) {
            food.name = req.body.name;  // update the food item info
        }
        if (req.body.image) {
            food.image = req.body.image; //
        }

        // save the food
        await food.save();

        res.json({
            message: 'Food has been updated!',
            data: food
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update food', details: err.message || err });
    }
};

module.exports.deleteFood = async function(req, res) { //delete the food by id
  try {
    await Food.findByIdAndDelete(req.params.food_id);
    res.json({ message: 'Successfully deleted food item' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete food', details: err.message || err });
  }
};






