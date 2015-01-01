//MODEL

//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


var UserSchema = new Schema({

    username : String,
    isVerified : Boolean,
    name : {
                first: String,
                last: String
            },

    local : {
        email : String,
        password : String,
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