const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  routes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
  }],
  consumers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
  }],
  apiKeys: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
  }],
  ipRules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IpBlockRule',
  }],
  geoRules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeoBlockRule',
  }],
  botRules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BotDetectionRule',
  }],
  transformations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TransformationRule',
  }],
  terminationRules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TerminationRule',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
