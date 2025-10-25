const express = require('express');
const router = express.Router();
const TerminationRule = require('../../models/TerminationRule');
const logger = require('../../utils/logger');

// Termination Rules management
router.get('/', async (req, res) => {
  try {
    const { routeId, active } = req.query;
    const query = {};

    if (routeId) query.routeId = routeId;
    if (active !== undefined) query.active = active === 'true';

    const rules = await TerminationRule.find(query)
      .populate('routeId', 'name path')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ data: rules });
  } catch (error) {
    logger.error('Get termination rules error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve termination rules',
      correlationId: req.correlationId
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const rule = new TerminationRule(req.body);
    await rule.save();
    res.status(201).json({ data: rule });
  } catch (error) {
    logger.error('Create termination rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create termination rule',
      correlationId: req.correlationId
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await TerminationRule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Termination rule not found',
        correlationId: req.correlationId
      });
    }

    res.json({ data: rule });
  } catch (error) {
    logger.error('Update termination rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update termination rule',
      correlationId: req.correlationId
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await TerminationRule.findByIdAndDelete(id);

    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Termination rule not found',
        correlationId: req.correlationId
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error('Delete termination rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete termination rule',
      correlationId: req.correlationId
    });
  }
});

// Test termination rule
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { sampleRequest } = req.body;

    const rule = await TerminationRule.findById(id);
    if (!rule) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Termination rule not found',
        correlationId: req.correlationId
      });
    }

    // Simulate termination check
    const terminationService = require('../../services/terminationService');
    const result = await terminationService.checkTermination(
      { ...sampleRequest, correlationId: req.correlationId },
      rule.routeId.toString()
    );

    res.json({ 
      data: {
        wouldTerminate: result.shouldTerminate,
        responseCode: result.responseCode,
        responseBody: result.responseBody,
        reason: result.reason
      }
    });
  } catch (error) {
    logger.error('Test termination rule error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to test termination rule',
      correlationId: req.correlationId
    });
  }
});

module.exports = router;
