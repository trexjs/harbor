const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
  },
  method: [{
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  }],
  targets: [{
    url: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      default: 50,
    },
    healthCheck: {
      type: Boolean,
      default: true,
    },
  }],
  loadBalancer: {
    algorithm: {
      type: String,
      enum: ['round-robin', 'least-connections', 'ip-hash', 'weighted-round-robin'],
      default: 'round-robin',
    },
    healthCheckInterval: {
      type: Number,
      default: 30000,
    },
  },
  stripPath: {
    type: Boolean,
    default: false,
  },
  preserveHost: {
    type: Boolean,
    default: false,
  },
  timeout: {
    type: Number,
    default: 30000,
  },
  active: {
    type: Boolean,
    default: true,
  },
  requireAuth: {
    type: Boolean,
    default: false,
  },
  rateLimit: {
    enabled: {
      type: Boolean,
      default: true,
    },
    windowMs: {
      type: Number,
      default: 900000, // 15 minutes
    },
    maxRequests: {
      type: Number,
      default: 100,
    },
  },
}, {
  timestamps: true,
});

// Index for faster route matching
routeSchema.index({ path: 1, active: 1 });

module.exports = mongoose.model('Route', routeSchema);
