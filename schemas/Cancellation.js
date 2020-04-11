const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cancellation = new Schema({
  Cancellationname: String,
  password: String,
  access: ["ADMIN", "MANAGER", "AGENT"]
});

Cancellation.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Cancellation", Cancellation);
