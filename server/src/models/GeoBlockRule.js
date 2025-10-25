const mongoose = require('mongoose');

const geoBlockRuleSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  action: {
    type: String,
    enum: ['block', 'allow', 'rate-limit'],
    default: 'block',
  },
  countries: [{
    type: String, // ISO country codes (e.g., 'US', 'GB', 'CN')
    required: true,
  }],
  type: {
    type: String,
    enum: ['whitelist', 'blacklist'],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  reason: {
    type: String,
    default: 'Geo-blocking rule',
  },
}, {
  timestamps: true,
});

// Index for faster lookups
geoBlockRuleSchema.index({ routeId: 1, active: 1 });
geoBlockRuleSchema.index({ countries: 1 });

module.exports = mongoose.model('GeoBlockRule', geoBlockRuleSchema);
