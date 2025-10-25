const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  customId: {
    type: String,
    unique: true,
    sparse: true,
  },
  tags: [String],
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Consumer', consumerSchema);
