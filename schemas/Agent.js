const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Agent = new Schema({
  name: String,
  email: String,
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Agent", Agent);
