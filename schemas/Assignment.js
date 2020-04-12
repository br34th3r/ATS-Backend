const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Assignment = new Schema({
  agentID: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  date: Date,
  blanks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blank" }]
});

module.exports = mongoose.model("Assignment", Assignment);
