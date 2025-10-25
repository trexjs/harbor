const express = require('express');
const router = express.Router();
const ipRuleController = require('../../controllers/ipRuleController');

router.get('/', ipRuleController.getIpRules);
router.post('/', ipRuleController.createIpRule);
router.put('/:id', ipRuleController.updateIpRule);
router.delete('/:id', ipRuleController.deleteIpRule);
router.post('/block-ip', ipRuleController.blockIp);
router.post('/unblock-ip', ipRuleController.unblockIp);

module.exports = router;
