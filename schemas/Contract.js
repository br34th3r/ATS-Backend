const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Contract = new Schema({
  Contractname: String,
  password: String,
  access: ["ADMIN", "MANAGER", "AGENT"]
});

Contract.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Contract", Contract);
