const express = require('express');
const router = express.Router();
const apiKeyController = require('../../controllers/apiKeyController');

// API Key management
router.get('/', apiKeyController.getAllApiKeys);
router.get('/:id', apiKeyController.getApiKeyById);
router.post('/', apiKeyController.createApiKey);
router.put('/:id/revoke', apiKeyController.revokeApiKey);
router.delete('/:id', apiKeyController.deleteApiKey);

module.exports = router;
