const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Blank = new Schema({
  type: {
    type: Number,
    enum: [101, 201, 420, 440, 444, 451, 452],
    default: 101
  },
  number: Number,
  isValid: Boolean,
  AgentID: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  sold: { type: Boolean, default: false }
});

module.exports = mongoose.model("Blank", Blank);
