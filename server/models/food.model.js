//MODEL

//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//define our schema
var FoodSchema = new Schema({
    name : { type: String, required: true },
    image : String,
}, { timestamps: true });

//export
module.exports = mongoose.model('Food', FoodSchema);
