//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//define our schema
var FoodSchema = new Schema({
    name: String
});

//export
module.exports = mongoose.model('Food', FoodSchema);