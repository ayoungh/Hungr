//MODEL

//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//define our schema
var FoodSchema = new Schema({
    name : String,
    image : String,
    dateCreated : String,
    dateModified : String,
});

//export
module.exports = mongoose.model('Food', FoodSchema);