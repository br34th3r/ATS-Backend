const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Commission = new Schema({
  percentage: Number,
  blankType: {
    type: Number,
    enum: [101, 201, 420, 440, 444, 451, 452],
    default: 101
  }
});

module.exports = mongoose.model("Commission", Commission);
