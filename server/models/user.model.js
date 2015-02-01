//MODEL

//Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


var UserSchema = new Schema({

    username : { type: String, lowercase: true } ,
    email : { type: String, unique: true, lowercase: true }, //this will check that no other accounts exist with same email when saving
    isVerified : Boolean,
    isAdmin : Boolean,
    dateCreated : String,
    dateModified : String,
    accessToken: String,
    name : {
                first: String,
                last: String
            },
    picture: String,        
    local : {
        password : String
    }

});


// UserSchema.pre('save', function(next) {
//   var user = this;
//   if (!user.isModified('password')) return next();
//   bcrypt.genSalt(5, function(err, salt) {
//     if (err) return next(err);
//     bcrypt.hash(user.password, salt, null, function(err, hash) {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });


//Methods
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

UserSchema.methods.validEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};



//export
module.exports = mongoose.model('User', UserSchema);