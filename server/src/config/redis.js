const { createClient } = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('Redis URL not provided. Rate limiting will use in-memory storage.');
      return null;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    logger.info('Redis Connected successfully');
    
    return redisClient;
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    logger.warn('Continuing without Redis. Some features may be limited.');
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient,
};
