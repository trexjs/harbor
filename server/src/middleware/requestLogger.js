const logger = require('../utils/logger');
const logService = require('../services/logService');

/**
 * Middleware to log all incoming requests
 */
const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  const logData = {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    headers: req.headers,
    timestamp: new Date().toISOString(),
  };

  // Log when response finishes
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;

    // Winston file logging
    logger.info('Request completed', {
      ...logData,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('content-length'),
    });

    // MongoDB logging
    try {
      await logService.logRequest({
        correlationId: req.correlationId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        geoLocation: req.geoLocation,
        userAgent: req.get('user-agent'),
        headers: req.headers,
        queryParams: req.query,
        requestBody: req.body ? JSON.stringify(req.body) : null,
        statusCode: res.statusCode,
        responseTime,
        responseSize: res.get('content-length') ? parseInt(res.get('content-length')) : null,
        consumer: req.consumer?.consumerId,
        apiKey: req.apiKey?._id,
        route: req.routeConfig?._id,
        botDetected: req.botDetected || false,
        botReason: req.botInfo?.reason,
        terminated: req.terminated || false,
        terminationReason: req.terminationReason,
        ipBlocked: req.ipBlocked || false,
        geoBlocked: req.geoBlocked || false,
        rateLimited: req.rateLimited || false,
        transformed: req.transformed || false,
        loadBalancerTarget: req.loadBalancerTarget,
        error: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('MongoDB logging error:', error);
    }
  });

  next();
};

module.exports = requestLoggerMiddleware;
