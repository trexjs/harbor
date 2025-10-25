const botDetectionService = require('../services/botDetectionService');
const BotDetectionRule = require('../models/BotDetectionRule');
const logger = require('../utils/logger');

/**
 * Bot detection middleware
 */
const botDetectionMiddleware = async (req, res, next) => {
  try {
    const route = req.routeConfig || {};
    const routeId = route._id ? route._id.toString() : null;

    if (!routeId) {
      return next();
    }

    // Get bot detection rules for this route
    const botRule = await BotDetectionRule.findOne({
      routeId,
      active: true,
    });

    if (!botRule || !botRule.enabled) {
      return next();
    }

    // Analyze request for bot patterns
    const detectionResult = botDetectionService.analyzeRequest(req, botRule);

    if (detectionResult.isBot) {
      const action = botDetectionService.getRecommendedAction(detectionResult, botRule);

      logger.warn('Bot detected', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        reason: detectionResult.reason,
        confidence: detectionResult.confidence,
        action,
        correlationId: req.correlationId,
      });

      req.botDetected = true;
      req.botInfo = detectionResult;

      // Apply action
      switch (action) {
        case 'block':
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Bot traffic is not allowed',
            correlationId: req.correlationId,
          });

        case 'challenge':
          return res.status(202).json({
            message: 'Please complete verification',
            correlationId: req.correlationId,
          });

        case 'rate-limit':
          // Continue but flag for rate limiting
          req.rateLimitMultiplier = 0.1; // Reduce rate limit to 10%
          break;

        default:
          // Allow but log
          break;
      }
    }

    next();
  } catch (error) {
    logger.error('Bot detection middleware error:', error);
    // Fail open - allow the request
    next();
  }
};

module.exports = botDetectionMiddleware;
