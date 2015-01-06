//MODEL

//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


var UserSchema = new Schema({

    username : String,
    email : { type: String, unique: true }, //this will check that no other accounts exist with same email when saving
    isVerified : Boolean,
    isAdmin : Boolean,
    dateCreated : String,
    dateModified : String,
    name : {
                first: String,
                last: String
            },

    local : {
        password : String
    }

});

//Methods
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

//export
module.exports = mongoose.model('User', UserSchema);