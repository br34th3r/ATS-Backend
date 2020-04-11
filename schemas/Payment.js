const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
  type: {
    type: String,
    enum: ["CASH", "CARD"],
    default: "CASH"
  },
  cardNumber: String,
  expiryDate: String,
  cvc: String,
  issuer: String,
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
});

module.exports = mongoose.model("Payment", Payment);
