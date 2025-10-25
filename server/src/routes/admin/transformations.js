const express = require('express');
const router = express.Router();
const transformationController = require('../../controllers/transformationController');

router.get('/', transformationController.getTransformationRules);
router.post('/', transformationController.createTransformationRule);
router.put('/:id', transformationController.updateTransformationRule);
router.delete('/:id', transformationController.deleteTransformationRule);
router.post('/:id/test', transformationController.testTransformationRule);

module.exports = router;
