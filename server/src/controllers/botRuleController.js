const BotDetectionRule = require('../models/BotDetectionRule');
const Log = require('../models/Log');
const logger = require('../utils/logger');

class BotRuleController {
  async getBotRules(req, res) {
    try {
      const { routeId, enabled, active } = req.query;
      const query = {};

      if (routeId) query.routeId = routeId;
      if (enabled !== undefined) query.enabled = enabled === 'true';
      if (active !== undefined) query.active = active === 'true';

      const rules = await BotDetectionRule.find(query)
        .populate('routeId', 'name path')
        .sort({ createdAt: -1 });

      res.json({ data: rules });
    } catch (error) {
      logger.error('Get bot rules error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve bot rules',
        correlationId: req.correlationId,
      });
    }
  }

  async getBotRuleStats(req, res) {
    try {
      const { routeId, startDate, endDate } = req.query;
      const matchQuery = {};

      if (routeId) matchQuery.route = routeId;
      if (startDate && endDate) {
        matchQuery.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const stats = await Log.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            botDetectedCount: { $sum: { $cond: ['$botDetected', 1, 0] } },
            botDetectionRate: {
              $avg: { $cond: ['$botDetected', 1, 0] },
            },
          },
        },
      ]);

      res.json({
        data: stats[0] || {
          totalRequests: 0,
          botDetectedCount: 0,
          botDetectionRate: 0,
        },
      });
    } catch (error) {
      logger.error('Get bot stats error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve bot statistics',
        correlationId: req.correlationId,
      });
    }
  }

  async createBotRule(req, res) {
    try {
      const rule = new BotDetectionRule(req.body);
      await rule.save();
      res.status(201).json({ data: rule });
    } catch (error) {
      logger.error('Create bot rule error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create bot rule',
        correlationId: req.correlationId,
      });
    }
  }

  async updateBotRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await BotDetectionRule.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!rule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Bot rule not found',
          correlationId: req.correlationId,
        });
      }

      res.json({ data: rule });
    } catch (error) {
      logger.error('Update bot rule error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update bot rule',
        correlationId: req.correlationId,
      });
    }
  }

  async deleteBotRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await BotDetectionRule.findByIdAndDelete(id);

      if (!rule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Bot rule not found',
          correlationId: req.correlationId,
        });
      }

      res.status(204).send();
    } catch (error) {
      logger.error('Delete bot rule error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete bot rule',
        correlationId: req.correlationId,
      });
    }
  }
}

module.exports = new BotRuleController();
