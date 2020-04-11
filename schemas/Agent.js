const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Agent = new Schema({
  name: String,
  email: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

Agent.methods.validPassword = function(password) {
  return this.password == password;
}

module.exports = mongoose.model("Agent", Agent);
