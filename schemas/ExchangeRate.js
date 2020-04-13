const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExchangeRate = new Schema({
  currencyCode: String,
  rate: Number,
  dateAdded: Date
});

module.exports = mongoose.model("ExchangeRate", ExchangeRate);
