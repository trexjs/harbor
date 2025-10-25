const express = require('express');
const router = express.Router();
const botRuleController = require('../../controllers/botRuleController');

router.get('/', botRuleController.getBotRules);
router.get('/stats', botRuleController.getBotRuleStats);
router.post('/', botRuleController.createBotRule);
router.put('/:id', botRuleController.updateBotRule);
router.delete('/:id', botRuleController.deleteBotRule);

module.exports = router;
