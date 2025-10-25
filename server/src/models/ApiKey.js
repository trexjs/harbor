const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const apiKeySchema = new mongoose.Schema({
  keyHash: {
    type: String,
    required: true,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  consumer: {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consumer',
      required: true,
    },
    name: String,
  },
  name: {
    type: String,
  },
  rateLimit: {
    requests: {
      type: Number,
      default: 100,
    },
    window: {
      type: String,
      default: '15m',
    },
  },
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  lastUsedAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Hash API key before saving
apiKeySchema.pre('save', async function (next) {
  if (!this.isModified('keyHash')) return next();
  this.keyHash = await bcrypt.hash(this.keyHash, 10);
  next();
});

// Compare API key
apiKeySchema.methods.compareKey = async function (plainKey) {
  return await bcrypt.compare(plainKey, this.keyHash);
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
