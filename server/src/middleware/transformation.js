const transformationService = require('../services/transformationService');
const TransformationRule = require('../models/TransformationRule');
const logger = require('../utils/logger');

/**
 * Request transformation middleware
 */
const requestTransformationMiddleware = async (req, res, next) => {
  try {
    const route = req.routeConfig || {};
    const routeId = route._id ? route._id.toString() : null;

    if (!routeId) {
      return next();
    }

    // Get transformation rules for this route
    const transformationRules = await TransformationRule.find({
      routeId,
      type: 'request',
      active: true,
    }).sort({ priority: 1 });

    if (transformationRules.length > 0) {
      // Transform request
      const transformedReq = transformationService.transformRequest(req, transformationRules);
      
      // Apply transformations to actual request
      req.headers = transformedReq.headers;
      req.body = transformedReq.body;
      req.path = transformedReq.path;
      req.query = transformedReq.query;

      req.transformed = true;
      logger.debug('Request transformed', {
        routeId,
        correlationId: req.correlationId,
      });
    }

    next();
  } catch (error) {
    logger.error('Request transformation middleware error:', error);
    // Fail open - allow the request
    next();
  }
};

/**
 * Response transformation middleware
 */
const responseTransformationMiddleware = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(data) {
    transformAndSend.call(this, data, originalSend);
  };

  res.json = function(data) {
    transformAndSend.call(this, data, originalJson);
  };

  async function transformAndSend(data, originalMethod) {
    try {
      const route = req.routeConfig || {};
      const routeId = route._id ? route._id.toString() : null;

      if (!routeId) {
        return originalMethod.call(this, data);
      }

      // Get transformation rules for this route
      const transformationRules = await TransformationRule.find({
        routeId,
        type: 'response',
        active: true,
      }).sort({ priority: 1 });

      if (transformationRules.length > 0) {
        const responseData = {
          headers: res.getHeaders(),
          body: data,
          statusCode: res.statusCode,
        };

        const transformedResponse = transformationService.transformResponse(responseData, transformationRules);

        // Apply header transformations
        Object.entries(transformedResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });

        data = transformedResponse.body;
        req.responseTransformed = true;

        logger.debug('Response transformed', {
          routeId,
          correlationId: req.correlationId,
        });
      }

      return originalMethod.call(this, data);
    } catch (error) {
      logger.error('Response transformation error:', error);
      // Send original data on error
      return originalMethod.call(this, data);
    }
  }

  next();
};

module.exports = {
  requestTransformationMiddleware,
  responseTransformationMiddleware,
};
