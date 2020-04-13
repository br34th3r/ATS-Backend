const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Customer = new Schema({
  name: String,
  surname: String,
  alias: String,
  discountStatus: {
    type: String,
    enum: ["NONE", "FIXED", "FLEXIBLE"],
    default: "NONE"
  },
  discountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discount',
    default: null
  }
  email: String,
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
  balance: Number
});

module.exports = mongoose.model("Customer", Customer);
