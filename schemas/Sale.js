const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Sale = new Schema({
  saleType: {
    type: String,
    enum: ["INTERLINE", "DOMESTIC"],
    default: "INTERLINE"
  },
  isPaid: { type: Boolean, default: false },
  costLocal: Number,
  costUSD: Number,
  localTaxes: Number,
  otherTaxes: Number,
  saleDate: Date,
  currentRate: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRate' },
  commission: { type: mongoose.Schema.Types.ObjectId, ref: "Commission" },
  agentID: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  paymentID: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  blankID: { type: mongoose.Schema.Types.ObjectId, ref: "Blank" }
});

module.exports = mongoose.model("Sale", Sale);
