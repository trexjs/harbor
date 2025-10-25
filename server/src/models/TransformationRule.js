const mongoose = require('mongoose');

const transformationRuleSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true,
  },
  type: {
    type: String,
    enum: ['request', 'response'],
    required: true,
  },
  actions: [{
    operation: {
      type: String,
      enum: ['add-header', 'remove-header', 'modify-header', 'add-body-field', 'remove-body-field', 'transform-body', 'rewrite-path', 'add-query-param', 'remove-query-param'],
      required: true,
    },
    target: {
      type: String, // Header name, JSONPath, query param name, etc.
    },
    value: mongoose.Schema.Types.Mixed, // Can be string, number, object, etc.
    jsonPath: String, // For JSONPath operations
    regex: String, // For path rewriting
    replacement: String, // For regex replacement
    condition: {
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
    },
  }],
  priority: {
    type: Number,
    default: 100,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
transformationRuleSchema.index({ routeId: 1, type: 1, active: 1 });

module.exports = mongoose.model('TransformationRule', transformationRuleSchema);
