const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * Basic Authentication middleware
 */
const authenticateBasic = (req, res, next) => {
  try {
    // Extract Basic Auth header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Basic authentication is required',
        correlationId: req.correlationId,
      });
    }

    // Decode Base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials format',
        correlationId: req.correlationId,
      });
    }

    // For MVP, use simple hardcoded credentials
    // In production, this should query a user database
    const validCredentials = validateBasicCredentials(username, password);
    
    if (!validCredentials) {
      logger.warn('Basic auth failed', {
        username,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
        correlationId: req.correlationId,
      });
    }

    // Attach user info to request
    req.user = {
      username,
      role: validCredentials.role,
      userId: validCredentials.userId,
    };

    logger.debug('Basic authentication successful', {
      username,
      correlationId: req.correlationId,
    });

    next();
  } catch (error) {
    logger.error('Basic authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      correlationId: req.correlationId,
    });
  }
};

/**
 * Validate Basic Auth credentials
 * For MVP, using hardcoded credentials
 * In production, this should query a user database
 */
function validateBasicCredentials(username, password) {
  // Hardcoded credentials for MVP
  const validUsers = [
    {
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      role: 'admin',
      userId: 'admin-user',
    },
    {
      username: 'user',
      password: 'user123',
      role: 'user',
      userId: 'regular-user',
    },
  ];

  const user = validUsers.find(u => u.username === username);
  
  if (!user || user.password !== password) {
    return false;
  }

  return {
    userId: user.userId,
    role: user.role,
  };
}

/**
 * Hash password for storage
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  authenticateBasic,
  hashPassword,
  comparePassword,
};
