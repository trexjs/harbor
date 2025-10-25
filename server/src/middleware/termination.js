const terminationService = require('../services/terminationService');
const logger = require('../utils/logger');

/**
 * Request termination middleware
 */
const terminationMiddleware = async (req, res, next) => {
  try {
    const route = req.routeConfig || {};
    const routeId = route._id ? route._id.toString() : null;

    if (!routeId) {
      return next();
    }

    // Check if request should be terminated
    const terminationResult = await terminationService.checkTermination(req, routeId);

    if (terminationResult.shouldTerminate) {
      logger.warn('Request terminated', {
        routeId,
        reason: terminationResult.reason,
        correlationId: req.correlationId,
      });

      req.terminated = true;
      req.terminationReason = terminationResult.reason;

      // Handle different termination actions
      switch (terminationResult.action) {
        case 'redirect':
          return res.redirect(terminationResult.redirectUrl);

        case 'transform':
          // Continue to transformation middleware
          req.terminationTransform = true;
          break;

        case 'terminate':
        default:
          return res.status(terminationResult.responseCode).json({
            error: 'Request Terminated',
            message: terminationResult.responseBody || 'Request was terminated by security policy',
            correlationId: req.correlationId,
          });
      }
    }

    next();
  } catch (error) {
    logger.error('Termination middleware error:', error);
    // Fail open - allow the request
    next();
  }
};

module.exports = terminationMiddleware;
