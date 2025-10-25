const ipBlockingService = require('../services/ipBlockingService');
const logger = require('../utils/logger');

/**
 * IP blocking middleware
 */
const ipBlockingMiddleware = async (req, res, next) => {
  try {
    const route = req.routeConfig || {};
    const routeId = route._id ? route._id.toString() : null;

    // Check if IP is blocked or allowed
    const ipStatus = await ipBlockingService.checkIP(req.ip, routeId);

    if (ipStatus.blocked) {
      logger.warn('IP blocked', {
        ip: req.ip,
        reason: ipStatus.reason,
        correlationId: req.correlationId,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your IP address has been blocked',
        correlationId: req.correlationId,
      });
    }

    if (ipStatus.allowed) {
      // IP is explicitly allowed in whitelist
      logger.debug('IP whitelisted', {
        ip: req.ip,
        correlationId: req.correlationId,
      });
    }

    next();
  } catch (error) {
    logger.error('IP blocking middleware error:', error);
    // Fail open - allow the request
    next();
  }
};

module.exports = ipBlockingMiddleware;
