const Log = require('../models/Log');
const logger = require('../utils/logger');

class LogService {
  /**
   * Log request to MongoDB
   * @param {Object} logData - Log data
   * @returns {Object} Created log entry
   */
  async logRequest(logData) {
    try {
      const logEntry = new Log({
        correlationId: logData.correlationId,
        method: logData.method,
        path: logData.path,
        ip: logData.ip,
        geoLocation: logData.geoLocation,
        userAgent: logData.userAgent,
        headers: logData.headers,
        queryParams: logData.queryParams,
        requestBody: logData.requestBody,
        statusCode: logData.statusCode,
        responseTime: logData.responseTime,
        responseSize: logData.responseSize,
        consumer: logData.consumer,
        apiKey: logData.apiKey,
        route: logData.route,
        botDetected: logData.botDetected || false,
        botReason: logData.botReason,
        terminated: logData.terminated || false,
        terminationReason: logData.terminationReason,
        ipBlocked: logData.ipBlocked || false,
        geoBlocked: logData.geoBlocked || false,
        rateLimited: logData.rateLimited || false,
        transformed: logData.transformed || false,
        loadBalancerTarget: logData.loadBalancerTarget,
        error: logData.error,
        stackTrace: logData.stackTrace,
        timestamp: logData.timestamp || new Date(),
      });

      return await logEntry.save();
    } catch (error) {
      logger.error('Log request error:', error);
      // Don't throw error to avoid breaking the request flow
      return null;
    }
  }

  /**
   * Get logs with filters
   * @param {Object} filters - Filter options
   * @returns {Array} Log entries
   */
  async getLogs(filters = {}) {
    try {
      const query = {};

      if (filters.correlationId) {
        query.correlationId = filters.correlationId;
      }

      if (filters.ip) {
        query.ip = filters.ip;
      }

      if (filters.statusCode) {
        query.statusCode = filters.statusCode;
      }

      if (filters.route) {
        query.route = filters.route;
      }

      if (filters.consumer) {
        query.consumer = filters.consumer;
      }

      if (filters.botDetected !== undefined) {
        query.botDetected = filters.botDetected;
      }

      if (filters.terminated !== undefined) {
        query.terminated = filters.terminated;
      }

      if (filters.startDate && filters.endDate) {
        query.timestamp = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      }

      const limit = filters.limit || 100;
      const skip = filters.skip || 0;

      return await Log.find(query)
        .populate('consumer', 'name email')
        .populate('apiKey', 'keyPrefix')
        .populate('route', 'name path')
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      logger.error('Get logs error:', error);
      return [];
    }
  }

  /**
   * Get logs by correlation ID
   * @param {string} correlationId - Correlation ID
   * @returns {Array} Log entries
   */
  async getLogsByCorrelationId(correlationId) {
    try {
      return await Log.find({ correlationId })
        .populate('consumer', 'name email')
        .populate('apiKey', 'keyPrefix')
        .populate('route', 'name path')
        .sort({ timestamp: 1 });
    } catch (error) {
      logger.error('Get logs by correlation ID error:', error);
      return [];
    }
  }

  /**
   * Get log statistics
   * @param {Object} filters - Filter options
   * @returns {Object} Statistics
   */
  async getLogStatistics(filters = {}) {
    try {
      const matchQuery = {};

      if (filters.startDate && filters.endDate) {
        matchQuery.timestamp = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      }

      const pipeline = [
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            avgResponseTime: { $avg: '$responseTime' },
            errorRate: {
              $avg: {
                $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
              }
            },
            botDetectedCount: {
              $sum: { $cond: ['$botDetected', 1, 0] }
            },
            terminatedCount: {
              $sum: { $cond: ['$terminated', 1, 0] }
            },
            ipBlockedCount: {
              $sum: { $cond: ['$ipBlocked', 1, 0] }
            },
            geoBlockedCount: {
              $sum: { $cond: ['$geoBlocked', 1, 0] }
            },
            rateLimitedCount: {
              $sum: { $cond: ['$rateLimited', 1, 0] }
            },
          }
        }
      ];

      const result = await Log.aggregate(pipeline);
      return result[0] || {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        botDetectedCount: 0,
        terminatedCount: 0,
        ipBlockedCount: 0,
        geoBlockedCount: 0,
        rateLimitedCount: 0,
      };
    } catch (error) {
      logger.error('Get log statistics error:', error);
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        botDetectedCount: 0,
        terminatedCount: 0,
        ipBlockedCount: 0,
        geoBlockedCount: 0,
        rateLimitedCount: 0,
      };
    }
  }
}

module.exports = new LogService();
