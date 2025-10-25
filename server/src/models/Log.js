const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  correlationId: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  geoLocation: {
    country: String,
    region: String,
    city: String,
  },
  userAgent: {
    type: String,
  },
  headers: mongoose.Schema.Types.Mixed,
  queryParams: mongoose.Schema.Types.Mixed,
  requestBody: String, // Store as string to avoid size issues
  statusCode: {
    type: Number,
    required: true,
  },
  responseTime: {
    type: Number, // in milliseconds
    required: true,
  },
  responseSize: Number,
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
  },
  botDetected: {
    type: Boolean,
    default: false,
  },
  botReason: String,
  terminated: {
    type: Boolean,
    default: false,
  },
  terminationReason: String,
  ipBlocked: Boolean,
  geoBlocked: Boolean,
  rateLimited: Boolean,
  transformed: Boolean,
  loadBalancerTarget: String,
  error: String,
  stackTrace: String,
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: false, // We use custom timestamp field
});

// Indexes for faster queries
logSchema.index({ correlationId: 1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ ip: 1 });
logSchema.index({ statusCode: 1 });
logSchema.index({ consumer: 1 });
logSchema.index({ route: 1 });
logSchema.index({ botDetected: 1 });
logSchema.index({ terminated: 1 });

module.exports = mongoose.model('Log', logSchema);
