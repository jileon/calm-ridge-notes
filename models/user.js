const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname:  String,
  username: {type: String, required: true, unique: true},
  password: {type: String, required:true}
});
  
userSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});


userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;