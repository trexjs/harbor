const Log = require('../models/Log');
const logger = require('../utils/logger');

class MetricsService {
  /**
   * Get Prometheus format metrics
   * @returns {string} Prometheus metrics
   */
  async getPrometheusMetrics() {
    try {
      const metrics = await this.collectMetrics();
      return this.formatPrometheusMetrics(metrics);
    } catch (error) {
      logger.error('Get Prometheus metrics error:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Collect metrics from logs
   * @returns {Object} Metrics data
   */
  async collectMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: oneHourAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
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
          statusCodes: {
            $push: '$statusCode'
          }
        }
      }
    ];

    const result = await Log.aggregate(pipeline);
    const metrics = result[0] || {
      totalRequests: 0,
      avgResponseTime: 0,
      errorCount: 0,
      botDetectedCount: 0,
      terminatedCount: 0,
      ipBlockedCount: 0,
      geoBlockedCount: 0,
      rateLimitedCount: 0,
      statusCodes: []
    };

    // Calculate response time percentiles
    const responseTimes = await this.getResponseTimePercentiles(oneHourAgo);
    metrics.p50 = responseTimes.p50;
    metrics.p95 = responseTimes.p95;
    metrics.p99 = responseTimes.p99;

    return metrics;
  }

  /**
   * Get response time percentiles
   * @param {Date} since - Start date
   * @returns {Object} Percentiles
   */
  async getResponseTimePercentiles(since) {
    try {
      const pipeline = [
        {
          $match: {
            timestamp: { $gte: since },
            responseTime: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            responseTimes: { $push: '$responseTime' }
          }
        }
      ];

      const result = await Log.aggregate(pipeline);
      const responseTimes = result[0]?.responseTimes || [];

      if (responseTimes.length === 0) {
        return { p50: 0, p95: 0, p99: 0 };
      }

      responseTimes.sort((a, b) => a - b);
      const len = responseTimes.length;

      return {
        p50: responseTimes[Math.floor(len * 0.5)],
        p95: responseTimes[Math.floor(len * 0.95)],
        p99: responseTimes[Math.floor(len * 0.99)]
      };
    } catch (error) {
      logger.error('Get response time percentiles error:', error);
      return { p50: 0, p95: 0, p99: 0 };
    }
  }

  /**
   * Format metrics as Prometheus format
   * @param {Object} metrics - Metrics data
   * @returns {string} Prometheus format
   */
  formatPrometheusMetrics(metrics) {
    const timestamp = Math.floor(Date.now() / 1000);
    
    return `# HELP api_gateway_requests_total Total number of requests
# TYPE api_gateway_requests_total counter
api_gateway_requests_total ${metrics.totalRequests} ${timestamp}

# HELP api_gateway_requests_errors_total Total number of error requests
# TYPE api_gateway_requests_errors_total counter
api_gateway_requests_errors_total ${metrics.errorCount} ${timestamp}

# HELP api_gateway_response_time_seconds Average response time in seconds
# TYPE api_gateway_response_time_seconds gauge
api_gateway_response_time_seconds ${metrics.avgResponseTime / 1000} ${timestamp}

# HELP api_gateway_response_time_p50_seconds 50th percentile response time
# TYPE api_gateway_response_time_p50_seconds gauge
api_gateway_response_time_p50_seconds ${metrics.p50 / 1000} ${timestamp}

# HELP api_gateway_response_time_p95_seconds 95th percentile response time
# TYPE api_gateway_response_time_p95_seconds gauge
api_gateway_response_time_p95_seconds ${metrics.p95 / 1000} ${timestamp}

# HELP api_gateway_response_time_p99_seconds 99th percentile response time
# TYPE api_gateway_response_time_p99_seconds gauge
api_gateway_response_time_p99_seconds ${metrics.p99 / 1000} ${timestamp}

# HELP api_gateway_bot_detected_total Total number of bot detections
# TYPE api_gateway_bot_detected_total counter
api_gateway_bot_detected_total ${metrics.botDetectedCount} ${timestamp}

# HELP api_gateway_terminated_total Total number of terminated requests
# TYPE api_gateway_terminated_total counter
api_gateway_terminated_total ${metrics.terminatedCount} ${timestamp}

# HELP api_gateway_ip_blocked_total Total number of IP blocked requests
# TYPE api_gateway_ip_blocked_total counter
api_gateway_ip_blocked_total ${metrics.ipBlockedCount} ${timestamp}

# HELP api_gateway_geo_blocked_total Total number of geo blocked requests
# TYPE api_gateway_geo_blocked_total counter
api_gateway_geo_blocked_total ${metrics.geoBlockedCount} ${timestamp}

# HELP api_gateway_rate_limited_total Total number of rate limited requests
# TYPE api_gateway_rate_limited_total counter
api_gateway_rate_limited_total ${metrics.rateLimitedCount} ${timestamp}

# HELP api_gateway_uptime_seconds Gateway uptime in seconds
# TYPE api_gateway_uptime_seconds gauge
api_gateway_uptime_seconds ${process.uptime()} ${timestamp}`;
  }

  /**
   * Get default metrics when collection fails
   * @returns {string} Default metrics
   */
  getDefaultMetrics() {
    const timestamp = Math.floor(Date.now() / 1000);
    
    return `# HELP api_gateway_uptime_seconds Gateway uptime in seconds
# TYPE api_gateway_uptime_seconds gauge
api_gateway_uptime_seconds ${process.uptime()} ${timestamp}

# HELP api_gateway_requests_total Total number of requests
# TYPE api_gateway_requests_total counter
api_gateway_requests_total 0 ${timestamp}`;
  }

  /**
   * Get JSON format metrics
   * @returns {Object} Metrics data
   */
  async getJsonMetrics() {
    try {
      const metrics = await this.collectMetrics();
      return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        metrics: {
          totalRequests: metrics.totalRequests,
          errorRate: metrics.totalRequests > 0 ? (metrics.errorCount / metrics.totalRequests) * 100 : 0,
          avgResponseTime: metrics.avgResponseTime,
          responseTimePercentiles: {
            p50: metrics.p50,
            p95: metrics.p95,
            p99: metrics.p99
          },
          security: {
            botDetected: metrics.botDetectedCount,
            terminated: metrics.terminatedCount,
            ipBlocked: metrics.ipBlockedCount,
            geoBlocked: metrics.geoBlockedCount,
            rateLimited: metrics.rateLimitedCount
          }
        }
      };
    } catch (error) {
      logger.error('Get JSON metrics error:', error);
      return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        metrics: {
          totalRequests: 0,
          errorRate: 0,
          avgResponseTime: 0,
          responseTimePercentiles: { p50: 0, p95: 0, p99: 0 },
          security: {
            botDetected: 0,
            terminated: 0,
            ipBlocked: 0,
            geoBlocked: 0,
            rateLimited: 0
          }
        }
      };
    }
  }
}

module.exports = new MetricsService();
