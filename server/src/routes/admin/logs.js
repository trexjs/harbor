const express = require('express');
const router = express.Router();
const logController = require('../../controllers/logController');

router.get('/', logController.getLogs);
router.get('/:correlationId', logController.getLogsByCorrelationId);
router.get('/stats/summary', logController.getLogSummary);

module.exports = router;
