const express = require('express');
const router = express.Router();
const TransformationRule = require('../../models/TransformationRule');
const logger = require('../../utils/logger');

// Transformation Rules management
router.get('/', async (req, res) => {
  try {
    const { routeId, type, active } = req.query;
    const query = {};

    if (routeId) query.routeId = routeId;
    if (type) query.type = type;
    if (active !== undefined) query.active = active === 'true';

    const rules = await TransformationRule.find(query)
      .populate('routeId', 'name path')
      .sort({ priority: 1, createdAt: -1 });

    res.json({ data: rules });
  } catch (error) {
    logger.error('Get transformation rules error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve transformation rules',
      correlationId: req.correlationId
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const rule = new TransformationRule(req.body);
    await rule.save();
    res.status(201).json({ data: rule });
  } catch (error) {
    logger.error('Create transformation rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create transformation rule',
      correlationId: req.correlationId
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await TransformationRule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transformation rule not found',
        correlationId: req.correlationId
      });
    }

    res.json({ data: rule });
  } catch (error) {
    logger.error('Update transformation rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update transformation rule',
      correlationId: req.correlationId
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await TransformationRule.findByIdAndDelete(id);

    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transformation rule not found',
        correlationId: req.correlationId
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Delete transformation rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete transformation rule',
      correlationId: req.correlationId
    });
  }
});

// Test transformation rule
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { sampleData } = req.body;

    const rule = await TransformationRule.findById(id);
    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Transformation rule not found',
        correlationId: req.correlationId
      });
    }

    // Simulate transformation
    const transformationService = require('../../services/transformationService');
    const transformedData = transformationService.transformRequest(
      { body: sampleData },
      [rule]
    );

    res.json({ 
      data: {
        original: sampleData,
        transformed: transformedData.body
      }
    });
  } catch (error) {
    logger.error('Test transformation rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to test transformation rule',
      correlationId: req.correlationId
    });
  }
});

module.exports = router;
