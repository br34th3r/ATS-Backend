const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ticket = new Schema({
  Ticketname: String,
  password: String,
  access: ["ADMIN", "MANAGER", "AGENT"]
});

Ticket.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Ticket", Ticket);
