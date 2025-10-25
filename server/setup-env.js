#!/usr/bin/env node

/**
 * Setup script to create .env file with default values
 * Run this script to set up environment variables for development
 */

const fs = require('fs');
const path = require('path');

const envContent = `# API Gateway Configuration
NODE_ENV=development
PORT=8080
ADMIN_PORT=8081

# Database Configuration
MONGO_URI=mongodb://localhost:27017/api-gateway
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=*
MAX_REQUEST_SIZE=10mb

# GeoIP
GEOIP_CACHE_TTL=86400

# Bot Detection
BOT_DETECTION_SENSITIVITY=medium

# Load Balancer
LOAD_BALANCER_HEALTH_CHECK_INTERVAL=30000
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    console.log('   If you want to recreate it, delete the existing .env file first.');
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please review and update the values as needed for your environment.');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

console.log('\n🚀 Next steps:');
console.log('1. Make sure MongoDB is running on localhost:27017');
console.log('2. Make sure Redis is running on localhost:6379 (optional)');
console.log('3. Run: npm start');
