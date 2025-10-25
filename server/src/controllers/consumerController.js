const Consumer = require('../models/Consumer');
const logger = require('../utils/logger');

class ConsumerController {
  /**
   * Get all consumers
   */
  async getAllConsumers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const consumers = await Consumer.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Consumer.countDocuments(query);

      res.json({
        data: consumers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get all consumers error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve consumers',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Get consumer by ID
   */
  async getConsumerById(req, res) {
    try {
      const { id } = req.params;
      const consumer = await Consumer.findById(id);

      if (!consumer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Consumer not found',
          correlationId: req.correlationId
        });
      }

      res.json({ data: consumer });
    } catch (error) {
      logger.error('Get consumer by ID error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve consumer',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Create new consumer
   */
  async createConsumer(req, res) {
    try {
      const consumerData = req.body;

      // Validate required fields
      if (!consumerData.name || !consumerData.email) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name and email are required',
          correlationId: req.correlationId
        });
      }

      // Check if email already exists
      const existingConsumer = await Consumer.findOne({ email: consumerData.email });
      if (existingConsumer) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Consumer with this email already exists',
          correlationId: req.correlationId
        });
      }

      const consumer = new Consumer(consumerData);
      await consumer.save();

      logger.info('Consumer created', {
        consumerId: consumer._id,
        name: consumer.name,
        email: consumer.email,
        correlationId: req.correlationId
      });

      res.status(201).json({ data: consumer });
    } catch (error) {
      logger.error('Create consumer error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create consumer',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Update consumer
   */
  async updateConsumer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const consumer = await Consumer.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!consumer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Consumer not found',
          correlationId: req.correlationId
        });
      }

      logger.info('Consumer updated', {
        consumerId: consumer._id,
        name: consumer.name,
        correlationId: req.correlationId
      });

      res.json({ data: consumer });
    } catch (error) {
      logger.error('Update consumer error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update consumer',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Delete consumer
   */
  async deleteConsumer(req, res) {
    try {
      const { id } = req.params;
      const consumer = await Consumer.findByIdAndDelete(id);

      if (!consumer) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Consumer not found',
          correlationId: req.correlationId
        });
      }

      logger.info('Consumer deleted', {
        consumerId: id,
        name: consumer.name,
        correlationId: req.correlationId
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete consumer error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete consumer',
        correlationId: req.correlationId
      });
    }
  }
}

module.exports = new ConsumerController();
