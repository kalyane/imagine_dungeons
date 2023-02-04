const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
   first_name: String,
   last_name: String,
   email: String,
   password: String
});

userSchema.pre('save', function(next) {
   const user = this;
   if (!user.isModified('password')) {
      return next();
   }

   bcrypt.genSalt(10, (err, salt) => {
      if (err) {
         return next(err);
      }
      bcrypt.hash(user.password, salt, (err, hash) => {
         if (err) {
            return next(err);
         }
         user.password = hash;
         next();
      });
   });
});

userSchema.methods.isValidPassword = async function(password) {
   const user = this;
   const compare = await bcrypt.compare(password, user.password);
 
   return compare;
 }

const User = mongoose.model('User', userSchema);

module.exports = User;