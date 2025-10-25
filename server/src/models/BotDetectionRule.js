const mongoose = require('mongoose');

const botDetectionRuleSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  sensitivity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  patterns: [{
    type: {
      type: String,
      enum: ['user-agent', 'request-pattern', 'behavior'],
      required: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['allow', 'block', 'challenge'],
      default: 'block',
    },
  }],
  whitelist: [{
    type: String, // Bot names to whitelist (e.g., 'Googlebot', 'Bingbot')
  }],
  rateLimitThreshold: {
    type: Number,
    default: 100, // requests per minute
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
botDetectionRuleSchema.index({ routeId: 1, active: 1 });

module.exports = mongoose.model('BotDetectionRule', botDetectionRuleSchema);
