const express = require('express');
const router = express.Router();
const terminationRuleController = require('../../controllers/terminationRuleController');

router.get('/', terminationRuleController.getTerminationRules);
router.post('/', terminationRuleController.createTerminationRule);
router.put('/:id', terminationRuleController.updateTerminationRule);
router.delete('/:id', terminationRuleController.deleteTerminationRule);
router.post('/:id/test', terminationRuleController.testTerminationRule);

module.exports = router;
