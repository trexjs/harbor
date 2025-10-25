const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * JWT Authentication middleware
 */
const authenticateJWT = (req, res, next) => {
  try {
    // Extract JWT token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'JWT token is required',
        correlationId: req.correlationId,
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Attach user info to request
    req.user = decoded;
    req.userId = decoded.userId || decoded.id;
    req.userRole = decoded.role || 'user';

    logger.debug('JWT authentication successful', {
      userId: req.userId,
      correlationId: req.correlationId,
    });

    next();
  } catch (error) {
    logger.error('JWT authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'JWT token has expired',
        correlationId: req.correlationId,
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid JWT token',
        correlationId: req.correlationId,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      correlationId: req.correlationId,
    });
  }
};

/**
 * Generate JWT token
 */
const generateJWT = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', { expiresIn });
};

/**
 * Verify JWT token (for refresh)
 */
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
  } catch (error) {
    throw error;
  }
};

module.exports = {
  authenticateJWT,
  generateJWT,
  verifyJWT,
};
