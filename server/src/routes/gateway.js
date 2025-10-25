const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const Route = require('../models/Route');
const logger = require('../utils/logger');

// Import all middleware
const rateLimiterMiddleware = require('../middleware/rateLimiter');
const ipBlockingMiddleware = require('../middleware/ipBlocking');
const geoBlockingMiddleware = require('../middleware/geoBlocking');
const botDetectionMiddleware = require('../middleware/botDetection');
const terminationMiddleware = require('../middleware/termination');
const { requestTransformationMiddleware, responseTransformationMiddleware } = require('../middleware/transformation');
const { loadBalancerMiddleware, releaseConnectionMiddleware } = require('../middleware/loadBalancer');
const { authenticateApiKey } = require('../middleware/auth');

/**
 * Gateway proxy middleware with all security and transformation features
 * Routes requests to appropriate backend services
 */
router.use('*', async (req, res, next) => {
  try {
    const { originalUrl, method } = req;

    // Find matching route
    const route = await Route.findOne({
      path: { $regex: `^${originalUrl.split('?')[0]}` },
      active: true,
      $or: [
        { method: { $in: [method] } },
        { method: [] }, // Route accepts all methods
      ],
    }).sort({ createdAt: -1 });

    if (!route) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No route found for this path',
        correlationId: req.correlationId,
      });
    }

    // Attach route config to request for middleware
    req.routeConfig = route;

    // Apply middleware in order
    await applyMiddleware(req, res, next);

  } catch (error) {
    logger.error('Gateway routing error', {
      correlationId: req.correlationId,
      error: error.message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to route request',
      correlationId: req.correlationId,
    });
  }
});

/**
 * Apply all middleware in the correct order
 */
async function applyMiddleware(req, res, next) {
  try {
    const route = req.routeConfig;

    // 1. IP Blocking (first security check)
    await ipBlockingMiddleware(req, res, () => {});

    // 2. Geo-blocking
    await geoBlockingMiddleware(req, res, () => {});

    // 3. Bot Detection
    await botDetectionMiddleware(req, res, () => {});

    // 4. Request Termination
    await terminationMiddleware(req, res, () => {});

    // 5. Authentication (if required)
    if (route.requireAuth) {
      await authenticateApiKey(req, res, () => {});
    }

    // 6. Rate Limiting
    const rateLimitConfig = {
      enabled: route.rateLimit?.enabled !== false,
      maxRequests: route.rateLimit?.maxRequests || 100,
      windowMs: route.rateLimit?.windowMs || 900000,
      strategy: 'ip', // Can be configured per route
    };

    await rateLimiterMiddleware(rateLimitConfig)(req, res, () => {});

    // 7. Request Transformation
    await requestTransformationMiddleware(req, res, () => {});

    // 8. Load Balancing
    await loadBalancerMiddleware(req, res, () => {});

    // 9. Response Transformation
    responseTransformationMiddleware(req, res, () => {});

    // 10. Release connection after response
    releaseConnectionMiddleware(req, res, () => {});

    // 11. Proxy to backend
    await proxyToBackend(req, res);

  } catch (error) {
    logger.error('Middleware application error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process request',
      correlationId: req.correlationId,
    });
  }
}

/**
 * Proxy request to backend service
 */
async function proxyToBackend(req, res) {
  const route = req.routeConfig;
  const selectedTarget = req.selectedTarget || route.targets[0];

  if (!selectedTarget) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'No backend target available',
      correlationId: req.correlationId,
    });
  }

  // Create proxy middleware
  const proxyMiddleware = createProxyMiddleware({
    target: selectedTarget.url,
    changeOrigin: true,
    pathRewrite: route.stripPath ? {
      [`^${route.path}`]: '',
    } : {},
    timeout: route.timeout || 30000,
    onProxyReq: (proxyReq, req) => {
      // Add correlation ID to downstream requests
      proxyReq.setHeader('X-Correlation-ID', req.correlationId);

      // Preserve or set host header
      if (!route.preserveHost) {
        const targetUrlObj = new URL(selectedTarget.url);
        proxyReq.setHeader('host', targetUrlObj.hostname);
      }

      logger.info('Proxying request', {
        correlationId: req.correlationId,
        method: req.method,
        path: req.path,
        target: selectedTarget.url,
        loadBalancerTarget: req.loadBalancerTarget,
      });
    },
    onError: (err, req, res) => {
      logger.error('Proxy error', {
        correlationId: req.correlationId,
        error: err.message,
        target: selectedTarget.url,
      });

      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to connect to backend service',
        correlationId: req.correlationId,
      });
    },
  });

  // Execute proxy
  proxyMiddleware(req, res);
}

module.exports = router;
