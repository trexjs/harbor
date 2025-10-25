const express = require('express');
const router = express.Router();
const logService = require('../../services/logService');
const logger = require('../../utils/logger');

// Logs management
router.get('/', async (req, res) => {
  try {
    const filters = {
      correlationId: req.query.correlationId,
      ip: req.query.ip,
      statusCode: req.query.statusCode ? parseInt(req.query.statusCode) : undefined,
      route: req.query.route,
      consumer: req.query.consumer,
      botDetected: req.query.botDetected === 'true',
      terminated: req.query.terminated === 'true',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      skip: req.query.skip ? parseInt(req.query.skip) : 0,
    };

    const logs = await logService.getLogs(filters);
    res.json({ data: logs });
  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve logs',
      correlationId: req.correlationId
    });
  }
});

router.get('/:correlationId', async (req, res) => {
  try {
    const { correlationId } = req.params;
    const logs = await logService.getLogsByCorrelationId(correlationId);
    res.json({ data: logs });
  } catch (error) {
    logger.error('Get logs by correlation ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve logs',
      correlationId: req.correlationId
    });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await logService.getLogStatistics(filters);
    res.json({ data: stats });
  } catch (error) {
    logger.error('Get log statistics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve log statistics',
      correlationId: req.correlationId
    });
  }
});

module.exports = router;
