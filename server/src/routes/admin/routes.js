const express = require('express');
const router = express.Router();
const routeController = require('../../controllers/routeController');

// Routes management
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);
router.patch('/:id/status', routeController.toggleRouteStatus);

module.exports = router;
