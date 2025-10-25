const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');

// Login endpoint (Basic Auth to JWT)
router.post('/login', authController.login);

// Refresh token endpoint
router.post('/refresh', authController.refreshToken);

// Logout endpoint (client-side token removal)
router.post('/logout', authController.logout);

// Verify token endpoint
router.get('/verify', authController.verifyToken);

module.exports = router;
