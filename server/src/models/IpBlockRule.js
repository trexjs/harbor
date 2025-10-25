const mongoose = require('mongoose');

const ipBlockRuleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['whitelist', 'blacklist'],
    required: true,
  },
  ips: [{
    type: String,
    required: true,
  }],
  reason: {
    type: String,
    default: 'No reason provided',
  },
  expiresAt: {
    type: Date,
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: 'system',
  },
}, {
  timestamps: true,
});

// Index for faster lookups
ipBlockRuleSchema.index({ active: 1, type: 1 });
ipBlockRuleSchema.index({ routeId: 1 });

module.exports = mongoose.model('IpBlockRule', ipBlockRuleSchema);
