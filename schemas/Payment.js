const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
  Paymentname: String,
  password: String,
  access: ["ADMIN", "MANAGER", "AGENT"]
});

Payment.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Payment", Payment);
