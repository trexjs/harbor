const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class RateLimitService {
  constructor() {
    this.redis = getRedisClient();
    this.memoryStore = new Map(); // Fallback in-memory store
  }

  /**
   * Check if request exceeds rate limit
   * @param {string} key - Rate limit key (e.g., IP, API key, endpoint)
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} Rate limit status
   */
  async checkRateLimit(key, maxRequests, windowMs) {
    const now = Date.now();
    const windowStart = now - (now % windowMs);

    try {
      if (this.redis) {
        return await this.checkWithRedis(key, maxRequests, windowStart, windowMs);
      } else {
        return this.checkWithMemory(key, maxRequests, windowStart, windowMs);
      }
    } catch (error) {
      logger.error('Rate limit check error:', error);
      // Fail open - allow the request
      return {
        allowed: true,
        remaining: maxRequests,
        reset: new Date(windowStart + windowMs),
      };
    }
  }

  /**
   * Check rate limit using Redis
   */
  async checkWithRedis(key, maxRequests, windowStart, windowMs) {
    const redisKey = `ratelimit:${key}:${windowStart}`;

    const current = await this.redis.incr(redisKey);
    
    if (current === 1) {
      await this.redis.pexpire(redisKey, windowMs);
    }

    const remaining = Math.max(0, maxRequests - current);
    const reset = new Date(windowStart + windowMs);

    return {
      allowed: current <= maxRequests,
      remaining,
      reset,
      total: current,
    };
  }

  /**
   * Check rate limit using in-memory store
   */
  checkWithMemory(key, maxRequests, windowStart, windowMs) {
    const redisKey = `ratelimit:${key}:${windowStart}`;
    
    if (!this.memoryStore.has(redisKey)) {
      this.memoryStore.set(redisKey, { count: 0, expire: Date.now() + windowMs });
    }

    const entry = this.memoryStore.get(redisKey);
    
    // Clean up expired entries
    if (entry.expire < Date.now()) {
      this.memoryStore.delete(redisKey);
      this.memoryStore.set(redisKey, { count: 1, expire: Date.now() + windowMs });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        reset: new Date(Date.now() + windowMs),
        total: 1,
      };
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);

    return {
      allowed: entry.count <= maxRequests,
      remaining,
      reset: new Date(entry.expire),
      total: entry.count,
    };
  }

  /**
   * Get rate limit headers for response
   * @param {Object} rateLimit - Rate limit result
   * @returns {Object} Headers to add to response
   */
  getRateLimitHeaders(rateLimit) {
    return {
      'X-RateLimit-Limit': rateLimit.total || 'unknown',
      'X-RateLimit-Remaining': rateLimit.remaining || 0,
      'X-RateLimit-Reset': Math.floor(rateLimit.reset.getTime() / 1000),
    };
  }

  /**
   * Clean up expired entries from memory store
   */
  cleanupMemoryStore() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expire < now) {
        this.memoryStore.delete(key);
      }
    }
  }
}

// Clean up memory store every 5 minutes
const service = new RateLimitService();
setInterval(() => {
  service.cleanupMemoryStore();
}, 5 * 60 * 1000);

module.exports = service;
