const { generateJWT, verifyJWT } = require('../middleware/jwtAuth');
const { authenticateBasic } = require('../middleware/basicAuth');
const logger = require('../utils/logger');

class AuthController {
  login = [
    authenticateBasic,
    (req, res) => {
      try {
        const { username, role, userId } = req.user;

        const token = generateJWT(
          {
            userId,
            username,
            role,
          },
          '24h'
        );

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
    },
  ];

  refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Token is required',
          correlationId: req.correlationId,
        });
      }

      const decoded = verifyJWT(token);

      const newToken = generateJWT(
        {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
        },
        '24h'
      );

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
  }

  logout(req, res) {
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
  }

  verifyToken(req, res) {
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
  }
}

module.exports = new AuthController();
