const express = require('express');
const router = express.Router();
const { generateJWT, verifyJWT } = require('../../middleware/jwtAuth');
const { authenticateBasic } = require('../../middleware/basicAuth');
const logger = require('../../utils/logger');

// Login endpoint (Basic Auth to JWT)
router.post('/login', authenticateBasic, (req, res) => {
  try {
    const { username, role, userId } = req.user;
    
    // Generate JWT token
    const token = generateJWT({
      userId,
      username,
      role,
    }, '24h');

    logger.info('User logged in', {
      username,
      role,
      correlationId: req.correlationId,
    });

    res.json({
      data: {
        token,
        user: {
          username,
          role,
          userId,
        },
        expiresIn: '24h',
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate token',
      correlationId: req.correlationId,
    });
  }
});

// Refresh token endpoint
router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token is required',
        correlationId: req.correlationId,
      });
    }

    // Verify existing token
    const decoded = verifyJWT(token);
    
    // Generate new token
    const newToken = generateJWT({
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    }, '24h');

    res.json({
      data: {
        token: newToken,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
        correlationId: req.correlationId,
      });
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
      correlationId: req.correlationId,
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  try {
    logger.info('User logged out', {
      correlationId: req.correlationId,
    });

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed',
      correlationId: req.correlationId,
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token is required',
        correlationId: req.correlationId,
      });
    }

    const decoded = verifyJWT(token);
    
    res.json({
      data: {
        valid: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
        },
      },
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
      correlationId: req.correlationId,
    });
  }
});

module.exports = router;
