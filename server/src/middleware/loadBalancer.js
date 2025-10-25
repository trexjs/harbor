const loadBalancerService = require('../services/loadBalancerService');
const logger = require('../utils/logger');

/**
 * Load balancer middleware
 */
const loadBalancerMiddleware = async (req, res, next) => {
  try {
    const route = req.routeConfig || {};

    if (!route.targets || route.targets.length === 0) {
      return next();
    }

    // If only one target, no need for load balancing
    if (route.targets.length === 1) {
      req.selectedTarget = route.targets[0];
      return next();
    }

    // Select target using load balancer
    const algorithm = route.loadBalancer?.algorithm || 'round-robin';
    const selectedTarget = loadBalancerService.selectTarget(route.targets, algorithm, req);

    if (!selectedTarget) {
      logger.error('No target selected by load balancer', {
        routeId: route._id,
        correlationId: req.correlationId,
      });
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'No healthy backend targets available',
        correlationId: req.correlationId,
      });
    }

    req.selectedTarget = selectedTarget;
    req.loadBalancerTarget = selectedTarget.url;

    logger.debug('Target selected by load balancer', {
      routeId: route._id,
      target: selectedTarget.url,
      algorithm,
      correlationId: req.correlationId,
    });

    next();
  } catch (error) {
    logger.error('Load balancer middleware error:', error);
    // Fail open - use first target
    const route = req.routeConfig || {};
    if (route.targets && route.targets.length > 0) {
      req.selectedTarget = route.targets[0];
    }
    next();
  }
};

/**
 * Release connection after request completion
 */
const releaseConnectionMiddleware = (req, res, next) => {
  const originalEnd = res.end;

  res.end = function(...args) {
    // Release connection from load balancer
    if (req.selectedTarget && req.selectedTarget.url) {
      loadBalancerService.releaseConnection(req.selectedTarget.url);
    }
    return originalEnd.apply(this, args);
  };

  next();
};

module.exports = {
  loadBalancerMiddleware,
  releaseConnectionMiddleware,
};
