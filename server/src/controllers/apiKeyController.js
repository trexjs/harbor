const ApiKey = require('../models/ApiKey');
const Consumer = require('../models/Consumer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class ApiKeyController {
  /**
   * Get all API keys
   */
  async getAllApiKeys(req, res) {
    try {
      const { page = 1, limit = 10, active, consumerId } = req.query;
      const skip = (page - 1) * limit;

      const query = {};
      if (active !== undefined) {
        query.active = active === 'true';
      }
      if (consumerId) {
        query['consumer.consumerId'] = consumerId;
      }

      const apiKeys = await ApiKey.find(query)
        .populate('consumer.consumerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await ApiKey.countDocuments(query);

      res.json({
        data: apiKeys,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get all API keys error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve API keys',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Get API key by ID
   */
  async getApiKeyById(req, res) {
    try {
      const { id } = req.params;
      const apiKey = await ApiKey.findById(id).populate('consumer.consumerId', 'name email');

      if (!apiKey) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'API key not found',
          correlationId: req.correlationId
        });
      }

      res.json({ data: apiKey });
    } catch (error) {
      logger.error('Get API key by ID error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve API key',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Create new API key
   */
  async createApiKey(req, res) {
    try {
      const { consumerId, name, rateLimit, routes, expiresAt } = req.body;

      // Validate required fields
      if (!consumerId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Consumer ID is required',
          correlationId: req.correlationId
        });
      }

      // Check if consumer exists
      const consumer = await Consumer.findById(consumerId);
      if (!consumer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Consumer not found',
          correlationId: req.correlationId
        });
      }

      // Generate API key
      const apiKeyValue = `ak_${uuidv4().replace(/-/g, '')}`;
      const keyPrefix = apiKeyValue.substring(0, 8);

      const apiKey = new ApiKey({
        keyHash: apiKeyValue,
        keyPrefix,
        consumer: {
          consumerId: consumer._id,
          name: consumer.name
        },
        name,
        rateLimit: rateLimit || { requests: 100, window: '15m' },
        routes: routes || [],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true
      });

      await apiKey.save();

      logger.info('API key created', {
        apiKeyId: apiKey._id,
        consumerId: consumer._id,
        keyPrefix,
        correlationId: req.correlationId
      });

      // Return the actual key value only once
      res.status(201).json({
        data: {
          ...apiKey.toObject(),
          key: apiKeyValue // Only returned on creation
        }
      });
    } catch (error) {
      logger.error('Create API key error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create API key',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(req, res) {
    try {
      const { id } = req.params;
      const apiKey = await ApiKey.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      );

      if (!apiKey) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'API key not found',
          correlationId: req.correlationId
        });
      }

      logger.info('API key revoked', {
        apiKeyId: apiKey._id,
        keyPrefix: apiKey.keyPrefix,
        correlationId: req.correlationId
      });

      res.json({ data: apiKey });
    } catch (error) {
      logger.error('Revoke API key error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to revoke API key',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(req, res) {
    try {
      const { id } = req.params;
      const apiKey = await ApiKey.findByIdAndDelete(id);

      if (!apiKey) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'API key not found',
          correlationId: req.correlationId
        });
      }

      logger.info('API key deleted', {
        apiKeyId: id,
        keyPrefix: apiKey.keyPrefix,
        correlationId: req.correlationId
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete API key error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete API key',
        correlationId: req.correlationId
      });
    }
  }
}

module.exports = new ApiKeyController();
