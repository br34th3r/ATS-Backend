const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  username: String,
  password: String,
  access: ["ADMIN", "MANAGER", "AGENT"]
});

User.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("User", User);
