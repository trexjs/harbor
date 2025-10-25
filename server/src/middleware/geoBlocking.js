const geoLocationService = require('../services/geoLocationService');
const GeoBlockRule = require('../models/GeoBlockRule');
const logger = require('../utils/logger');

/**
 * Geo-blocking middleware
 */
const geoBlockingMiddleware = async (req, res, next) => {
  try {
    const route = req.routeConfig || {};
    const routeId = route._id ? route._id.toString() : null;

    if (!routeId) {
      return next();
    }

    // Get geo-block rules for this route
    const geoRules = await GeoBlockRule.find({
      routeId,
      active: true,
    });

    if (geoRules.length === 0) {
      return next();
    }

    // Get country from IP
    const geoInfo = await geoLocationService.getCountryFromIP(req.ip);
    const country = geoInfo.country;

    // Check against geo-block rules
    for (const rule of geoRules) {
      const matchesCountry = rule.countries.includes(country);

      if (rule.type === 'blacklist' && matchesCountry) {
        logger.warn('Geo-block: Country blocked', {
          ip: req.ip,
          country,
          routeId,
          correlationId: req.correlationId,
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access from your location is not allowed',
          correlationId: req.correlationId,
        });
      }

      if (rule.type === 'whitelist' && !matchesCountry) {
        logger.warn('Geo-block: Country not whitelisted', {
          ip: req.ip,
          country,
          routeId,
          correlationId: req.correlationId,
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access from your location is not allowed',
          correlationId: req.correlationId,
        });
      }
    }

    // Store geo info for logging
    req.geoLocation = geoInfo;

    next();
  } catch (error) {
    logger.error('Geo-blocking middleware error:', error);
    // Fail open - allow the request
    next();
  }
};

module.exports = geoBlockingMiddleware;
