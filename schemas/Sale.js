const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Sale = new Schema({
  Salename: String,
  password: String,
  access: ["ADMIN", "MANAGER", "AGENT"]
});

Sale.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Sale", Sale);
