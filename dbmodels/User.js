const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
   first_name: String,
   last_name: String,
   email: String,
   password: String
});

userSchema.plugin(passportLocalMongoose, { usernameField : 'email' });

const User = mongoose.model('User', userSchema);

module.exports = User;