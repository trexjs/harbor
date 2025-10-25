const IpBlockRule = require('../models/IpBlockRule');
const ipBlockingService = require('../services/ipBlockingService');
const logger = require('../utils/logger');

class IpRuleController {
  async getIpRules(req, res) {
    try {
      const { routeId, type, active } = req.query;
      const query = {};

      if (routeId) query.routeId = routeId;
      if (type) query.type = type;
      if (active !== undefined) query.active = active === 'true';

      const rules = await IpBlockRule.find(query)
        .populate('routeId', 'name path')
        .sort({ createdAt: -1 });

      res.json({ data: rules });
    } catch (error) {
      logger.error('Get IP rules error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve IP rules',
        correlationId: req.correlationId,
      });
    }
  }

  async createIpRule(req, res) {
    try {
      const rule = await ipBlockingService.createOrUpdateRule(req.body);
      res.status(201).json({ data: rule });
    } catch (error) {
      logger.error('Create IP rule error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create IP rule',
        correlationId: req.correlationId,
      });
    }
  }

  async updateIpRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await IpBlockRule.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!rule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'IP rule not found',
          correlationId: req.correlationId,
        });
      }

      res.json({ data: rule });
    } catch (error) {
      logger.error('Update IP rule error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update IP rule',
        correlationId: req.correlationId,
      });
    }
  }

  async deleteIpRule(req, res) {
    try {
      const { id } = req.params;
      const rule = await IpBlockRule.findByIdAndDelete(id);

      if (!rule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'IP rule not found',
          correlationId: req.correlationId,
        });
      }

      res.status(204).send();
    } catch (error) {
      logger.error('Delete IP rule error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete IP rule',
        correlationId: req.correlationId,
      });
    }
  }

  async blockIp(req, res) {
    try {
      const { ip, reason, expiresAt } = req.body;

      if (!ip) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'IP address is required',
          correlationId: req.correlationId,
        });
      }

      const rule = await ipBlockingService.blockIP(ip, reason, expiresAt);
      res.status(201).json({ data: rule });
    } catch (error) {
      logger.error('Block IP error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to block IP',
        correlationId: req.correlationId,
      });
    }
  }

  async unblockIp(req, res) {
    try {
      const { ip } = req.body;

      if (!ip) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'IP address is required',
          correlationId: req.correlationId,
        });
      }

      await ipBlockingService.unblockIP(ip);
      res.json({ message: 'IP unblocked successfully' });
    } catch (error) {
      logger.error('Unblock IP error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to unblock IP',
        correlationId: req.correlationId,
      });
    }
  }
}

module.exports = new IpRuleController();
