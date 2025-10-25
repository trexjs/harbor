const ApiKey = require('../models/ApiKey');

/**
 * Middleware to authenticate requests using API keys
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    // Extract API key from header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required',
        correlationId: req.correlationId,
      });
    }

    // Find active API key
    const keyDoc = await ApiKey.findOne({ active: true });

    if (!keyDoc) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
        correlationId: req.correlationId,
      });
    }

    // Compare API key
    const isValid = await keyDoc.compareKey(apiKey);

    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
        correlationId: req.correlationId,
      });
    }

    // Check if key has expired
    if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key has expired',
        correlationId: req.correlationId,
      });
    }

    // Update last used time
    keyDoc.lastUsedAt = new Date();
    await keyDoc.save();

    // Attach consumer info to request
    req.consumer = keyDoc.consumer;
    req.apiKey = keyDoc;

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      correlationId: req.correlationId,
    });
  }
};

module.exports = {
  authenticateApiKey,
};
