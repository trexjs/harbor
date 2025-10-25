const mongoose = require('mongoose');

const terminationRuleSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 100,
  },
  conditions: [{
    field: {
      type: String,
      enum: ['ip', 'user-agent', 'header', 'path', 'method', 'query-param', 'request-size', 'country'],
      required: true,
    },
    operator: {
      type: String,
      enum: ['equals', 'not-equals', 'contains', 'not-contains', 'in', 'not-in', 'matches', 'greater-than', 'less-than'],
      required: true,
    },
    value: mongoose.Schema.Types.Mixed,
    headerName: String, // For header conditions
  }],
  action: {
    type: String,
    enum: ['terminate', 'redirect', 'transform'],
    default: 'terminate',
  },
  responseCode: {
    type: Number,
    default: 403,
  },
  responseBody: {
    type: String,
  },
  redirectUrl: {
    type: String,
  },
  logReason: {
    type: Boolean,
    default: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
terminationRuleSchema.index({ routeId: 1, active: 1, priority: -1 });

module.exports = mongoose.model('TerminationRule', terminationRuleSchema);
