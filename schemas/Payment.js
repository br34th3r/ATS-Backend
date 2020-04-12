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

Payment.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {
    this.findOne(condition, (err, result) => {
        return result ? callback(err, result) : this.create(condition, (err, result) => { return callback(err, result) });
    })
}

module.exports = mongoose.model("Payment", Payment);
