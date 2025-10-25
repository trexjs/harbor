const mongoose = require('mongoose');
const Project = require('../models/Project');
const Route = require('../models/Route');
const Consumer = require('../models/Consumer');
const ApiKey = require('../models/ApiKey');
const IpBlockRule = require('../models/IpBlockRule');
const GeoBlockRule = require('../models/GeoBlockRule');
const BotDetectionRule = require('../models/BotDetectionRule');
const TransformationRule = require('../models/TransformationRule');
const TerminationRule = require('../models/TerminationRule');
const logger = require('../utils/logger');

const toObjectIdArray = (input = []) => {
  if (!Array.isArray(input)) {
    return [];
  }

  const deduped = new Set();

  input.forEach((item) => {
    if (!item) return;
    if (typeof item === 'string') {
      deduped.add(item);
      return;
    }
    if (typeof item === 'object' && item._id) {
      deduped.add(item._id.toString());
    }
  });

  return Array.from(deduped)
    .filter((value) => mongoose.Types.ObjectId.isValid(value))
    .map((value) => new mongoose.Types.ObjectId(value));
};

class ProjectController {
  async getProjects(req, res) {
    try {
      const projects = await Project.find()
        .sort({ createdAt: -1 })
        .populate('routes', 'name path')
        .populate('consumers', 'name email')
        .populate('apiKeys', 'name keyPrefix')
        .populate('ipRules', 'name action')
        .populate('geoRules', 'action countries type')
        .populate('botRules', 'name riskLevel')
        .populate('transformations', 'type priority')
        .populate('terminationRules', 'name type');

      res.json({ data: projects });
    } catch (error) {
      logger.error('Get projects error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve projects',
        correlationId: req.correlationId,
      });
    }
  }

  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findById(id)
        .populate('routes', 'name path')
        .populate('consumers', 'name email')
        .populate('apiKeys', 'name keyPrefix')
        .populate('ipRules', 'name action')
        .populate('geoRules', 'action countries type')
        .populate('botRules', 'name riskLevel')
        .populate('transformations', 'type priority')
        .populate('terminationRules', 'name type');

      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found',
          correlationId: req.correlationId,
        });
      }

      res.json({ data: project });
    } catch (error) {
      logger.error('Get project by id error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve project',
        correlationId: req.correlationId,
      });
    }
  }

  async createProject(req, res) {
    try {
      const { name, description = '', status = 'active' } = req.body;

      if (!name) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Project name is required',
          correlationId: req.correlationId,
        });
      }

      const normalizedName = name.trim();

      const existing = await Project.findOne({ name: normalizedName });
      if (existing) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Project name already exists',
          correlationId: req.correlationId,
        });
      }

      const project = new Project({
        name: normalizedName,
        description: description?.trim?.() ?? description,
        status: status === 'inactive' ? 'inactive' : 'active',
        routes: toObjectIdArray(req.body.routes),
        consumers: toObjectIdArray(req.body.consumers),
        apiKeys: toObjectIdArray(req.body.apiKeys),
        ipRules: toObjectIdArray(req.body.ipRules),
        geoRules: toObjectIdArray(req.body.geoRules),
        botRules: toObjectIdArray(req.body.botRules),
        transformations: toObjectIdArray(req.body.transformations),
        terminationRules: toObjectIdArray(req.body.terminationRules),
      });

      await project.save();

      logger.info('Project created', { projectId: project._id, correlationId: req.correlationId });
      res.status(201).json({ data: project });
    } catch (error) {
      logger.error('Create project error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create project',
        correlationId: req.correlationId,
      });
    }
  }

  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
        const providedName = req.body.name;
        updateData.name = typeof providedName === 'string' ? providedName.trim() : providedName;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
        const providedDescription = req.body.description;
        updateData.description = typeof providedDescription === 'string' ? providedDescription.trim() : providedDescription;
      }

      if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
        updateData.status = req.body.status === 'inactive' ? 'inactive' : 'active';
      }

      const arrayFields = ['routes', 'consumers', 'apiKeys', 'ipRules', 'geoRules', 'botRules', 'transformations', 'terminationRules'];

      arrayFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updateData[field] = toObjectIdArray(req.body[field]);
        }
      });

      const project = await Project.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found',
          correlationId: req.correlationId,
        });
      }

      logger.info('Project updated', { projectId: project._id, correlationId: req.correlationId });
      res.json({ data: project });
    } catch (error) {
      logger.error('Update project error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update project',
        correlationId: req.correlationId,
      });
    }
  }

  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project not found',
          correlationId: req.correlationId,
        });
      }

      logger.info('Project deleted', { projectId: id, correlationId: req.correlationId });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete project error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete project',
        correlationId: req.correlationId,
      });
    }
  }

  async getResourceCatalog(req, res) {
    try {
      const [routes, consumers, apiKeys, ipRules, geoRules, botRules, transformations, terminationRules] = await Promise.all([
        Route.find({}, 'name path'),
        Consumer.find({}, 'name email'),
        ApiKey.find({}, 'name keyPrefix'),
        IpBlockRule.find({}, 'name action'),
        GeoBlockRule.find({}, 'type action countries'),
        BotDetectionRule.find({}, 'name riskLevel'),
        TransformationRule.find({}, 'type priority'),
        TerminationRule.find({}, 'name type'),
      ]);

      res.json({
        data: {
          routes,
          consumers,
          apiKeys,
          ipRules,
          geoRules,
          botRules,
          transformations,
          terminationRules,
        },
      });
    } catch (error) {
      logger.error('Get project resource catalog error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to load project resources',
        correlationId: req.correlationId,
      });
    }
  }
}

module.exports = new ProjectController();
