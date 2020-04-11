const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ticket = new Schema({
  isValid: Boolean,
  departure: String,
  destination: String,
  saleDate: Date,
  blankIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blank' }],
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
});

Ticket.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Ticket", Ticket);
