const rateLimitService = require('../services/rateLimitService');
const logger = require('../utils/logger');

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limit options
 */
const rateLimiterMiddleware = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Skip rate limiting if disabled for this route
      if (options.enabled === false) {
        return next();
      }

      const route = req.routeConfig || {};
      const rateLimitConfig = route.rateLimit || options;

      if (!rateLimitConfig.enabled) {
        return next();
      }

      // Determine rate limit key
      const key = getRateLimitKey(req, options);
      const maxRequests = rateLimitConfig.maxRequests || options.maxRequests || 100;
      const windowMs = rateLimitConfig.windowMs || options.windowMs || 900000; // 15 minutes

      // Check rate limit
      const result = await rateLimitService.checkRateLimit(key, maxRequests, windowMs);

      // Add rate limit headers
      const headers = rateLimitService.getRateLimitHeaders(result);
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Check if rate limit exceeded
      if (!result.allowed) {
        logger.warn('Rate limit exceeded', {
          key,
          correlationId: req.correlationId,
          ip: req.ip,
        });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          correlationId: req.correlationId,
          reset: Math.floor(result.reset.getTime() / 1000),
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      // Fail open - allow the request
      next();
    }
  };
};

/**
 * Get rate limit key based on strategy
 */
function getRateLimitKey(req, options) {
  const strategy = options.strategy || 'ip'; // 'ip', 'api-key', 'endpoint', 'user'

  switch (strategy) {
    case 'api-key':
      return `api-key:${req.apiKey?._id || req.ip}`;
    case 'endpoint':
      return `endpoint:${req.method}:${req.path}`;
    case 'user':
      return `user:${req.consumer?.consumerId || req.ip}`;
    case 'ip':
    default:
      return `ip:${req.ip}`;
  }
}

module.exports = rateLimiterMiddleware;
