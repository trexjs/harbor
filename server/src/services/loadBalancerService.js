const logger = require('../utils/logger');
const axios = require('axios');

class LoadBalancerService {
  constructor() {
    this.connections = new Map(); // Track active connections per target
    this.targetStats = new Map(); // Track statistics per target
  }

  /**
   * Select target based on algorithm
   * @param {Array} targets - Array of target URLs
   * @param {string} algorithm - Load balancing algorithm
   * @param {Object} req - Express request
   * @returns {Object} Selected target
   */
  selectTarget(targets, algorithm, req) {
    const healthyTargets = targets.filter(t => t.healthStatus !== 'unhealthy');

    if (healthyTargets.length === 0) {
      logger.warn('No healthy targets available');
      return targets[0]; // Fallback to first target
    }

    switch (algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyTargets);
      case 'least-connections':
        return this.leastConnections(healthyTargets);
      case 'ip-hash':
        return this.ipHash(healthyTargets, req);
      case 'weighted-round-robin':
        return this.weightedRoundRobin(healthyTargets);
      default:
        return this.roundRobin(healthyTargets);
    }
  }

  /**
   * Round-robin algorithm
   */
  roundRobin(targets) {
    if (!this.targetStats.has('roundRobin')) {
      this.targetStats.set('roundRobin', { index: 0 });
    }
    const stats = this.targetStats.get('roundRobin');
    const target = targets[stats.index % targets.length];
    stats.index++;
    return target;
  }

  /**
   * Least connections algorithm
   */
  leastConnections(targets) {
    let minConnections = Infinity;
    let selectedTarget = targets[0];

    for (const target of targets) {
      const connections = this.connections.get(target.url) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedTarget = target;
      }
    }

    // Increment connection count
    const current = this.connections.get(selectedTarget.url) || 0;
    this.connections.set(selectedTarget.url, current + 1);

    return selectedTarget;
  }

  /**
   * IP hash algorithm (session affinity)
   */
  ipHash(targets, req) {
    const clientIP = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const hash = this.simpleHash(clientIP);
    const index = hash % targets.length;
    return targets[index];
  }

  /**
   * Weighted round-robin algorithm
   */
  weightedRoundRobin(targets) {
    if (!this.targetStats.has('weightedRoundRobin')) {
      this.targetStats.set('weightedRoundRobin', {
        currentWeights: targets.map(t => t.weight || 100),
        currentIndices: targets.map((_, i) => i),
      });
    }

    const stats = this.targetStats.get('weightedRoundRobin');
    const totalWeight = stats.currentWeights.reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) {
      return targets[0];
    }

    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < stats.currentWeights.length; i++) {
      random -= stats.currentWeights[i];
      if (random <= 0) {
        selectedIndex = stats.currentIndices[i];
        break;
      }
    }

    return targets[selectedIndex];
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Decrement connection count for target
   */
  releaseConnection(targetUrl) {
    const current = this.connections.get(targetUrl) || 0;
    if (current > 0) {
      this.connections.set(targetUrl, current - 1);
    }
  }

  /**
   * Check health of a target
   * @param {Object} target - Target configuration
   * @returns {Promise<boolean>} Is healthy
   */
  async checkHealth(target) {
    try {
      const healthEndpoint = `${target.url}/health`;
      const response = await axios.get(healthEndpoint, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
      });

      const healthy = response.status === 200;
      
      // Update target health status
      target.lastChecked = new Date();
      target.healthStatus = healthy ? 'healthy' : 'unhealthy';

      return healthy;
    } catch (error) {
      logger.error(`Health check failed for ${target.url}:`, error.message);
      target.lastChecked = new Date();
      target.healthStatus = 'unhealthy';
      return false;
    }
  }

  /**
   * Check health for all targets in a route
   * @param {Object} route - Route with targets
   */
  async checkHealthForRoute(route) {
    if (!route.targets || route.targets.length === 0) return;

    for (const target of route.targets) {
      if (target.healthCheck !== false) {
        await this.checkHealth(target);
      } else {
        target.healthStatus = 'healthy'; // Assume healthy if health check disabled
      }
    }
  }
}

module.exports = new LoadBalancerService();
