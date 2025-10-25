const express = require('express');
const router = express.Router();
const GeoBlockRule = require('../../models/GeoBlockRule');
const logger = require('../../utils/logger');

// Geo Rules management
router.get('/', async (req, res) => {
  try {
    const { routeId, type, active } = req.query;
    const query = {};

    if (routeId) query.routeId = routeId;
    if (type) query.type = type;
    if (active !== undefined) query.active = active === 'true';

    const rules = await GeoBlockRule.find(query)
      .populate('routeId', 'name path')
      .sort({ createdAt: -1 });

    res.json({ data: rules });
  } catch (error) {
    logger.error('Get geo rules error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve geo rules',
      correlationId: req.correlationId
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const rule = new GeoBlockRule(req.body);
    await rule.save();
    res.status(201).json({ data: rule });
  } catch (error) {
    logger.error('Create geo rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create geo rule',
      correlationId: req.correlationId
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await GeoBlockRule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Geo rule not found',
        correlationId: req.correlationId
      });
    }

    res.json({ data: rule });
  } catch (error) {
    logger.error('Update geo rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update geo rule',
      correlationId: req.correlationId
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await GeoBlockRule.findByIdAndDelete(id);

    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Geo rule not found',
        correlationId: req.correlationId
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Delete geo rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete geo rule',
      correlationId: req.correlationId
    });
  }
});

module.exports = router;
