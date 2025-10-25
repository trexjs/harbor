const Route = require('../models/Route');
const logger = require('../utils/logger');

class RouteController {
  /**
   * Get all routes
   */
  async getAllRoutes(req, res) {
    try {
      const { page = 1, limit = 10, active, search } = req.query;
      const skip = (page - 1) * limit;

      const query = {};
      if (active !== undefined) {
        query.active = active === 'true';
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { path: { $regex: search, $options: 'i' } }
        ];
      }

      const routes = await Route.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Route.countDocuments(query);

      res.json({
        data: routes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get all routes error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve routes',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Get route by ID
   */
  async getRouteById(req, res) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Route not found',
          correlationId: req.correlationId
        });
      }

      res.json({ data: route });
    } catch (error) {
      logger.error('Get route by ID error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve route',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Create new route
   */
  async createRoute(req, res) {
    try {
      const routeData = req.body;

      // Validate required fields
      if (!routeData.name || !routeData.path || !routeData.targets) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Name, path, and targets are required',
          correlationId: req.correlationId
        });
      }

      const route = new Route(routeData);
      await route.save();

      logger.info('Route created', {
        routeId: route._id,
        name: route.name,
        correlationId: req.correlationId
      });

      res.status(201).json({ data: route });
    } catch (error) {
      logger.error('Create route error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create route',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Update route
   */
  async updateRoute(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const route = await Route.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!route) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Route not found',
          correlationId: req.correlationId
        });
      }

      logger.info('Route updated', {
        routeId: route._id,
        name: route.name,
        correlationId: req.correlationId
      });

      res.json({ data: route });
    } catch (error) {
      logger.error('Update route error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update route',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Delete route
   */
  async deleteRoute(req, res) {
    try {
      const { id } = req.params;
      const route = await Route.findByIdAndDelete(id);

      if (!route) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Route not found',
          correlationId: req.correlationId
        });
      }

      logger.info('Route deleted', {
        routeId: id,
        name: route.name,
        correlationId: req.correlationId
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete route error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete route',
        correlationId: req.correlationId
      });
    }
  }

  /**
   * Toggle route active status
   */
  async toggleRouteStatus(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      const route = await Route.findByIdAndUpdate(
        id,
        { active },
        { new: true }
      );

      if (!route) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Route not found',
          correlationId: req.correlationId
        });
      }

      logger.info('Route status toggled', {
        routeId: route._id,
        name: route.name,
        active: route.active,
        correlationId: req.correlationId
      });

      res.json({ data: route });
    } catch (error) {
      logger.error('Toggle route status error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to toggle route status',
        correlationId: req.correlationId
      });
    }
  }
}

module.exports = new RouteController();
