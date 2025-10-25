const express = require('express');
const router = express.Router();
const geoRuleController = require('../../controllers/geoRuleController');

router.get('/', geoRuleController.getGeoRules);
router.post('/', geoRuleController.createGeoRule);
router.put('/:id', geoRuleController.updateGeoRule);
router.delete('/:id', geoRuleController.deleteGeoRule);

module.exports = router;
