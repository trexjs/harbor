const TerminationRule = require('../models/TerminationRule');
const logger = require('../utils/logger');

class TerminationService {
  /**
   * Check if request should be terminated
   * @param {Object} req - Express request
   * @param {string} routeId - Route ID
   * @returns {Object} Termination result
   */
  async checkTermination(req, routeId) {
    try {
      if (!routeId) {
        return { shouldTerminate: false };
      }

      // Get termination rules for this route, ordered by priority (highest first)
      const rules = await TerminationRule.find({
        routeId,
        active: true,
      }).sort({ priority: -1 });

      for (const rule of rules) {
        if (this.evaluateConditions(req, rule.conditions)) {
          logger.info('Request terminated by rule', {
            ruleId: rule._id,
            priority: rule.priority,
            correlationId: req.correlationId,
          });

          return {
            shouldTerminate: true,
            responseCode: rule.responseCode,
            responseBody: rule.responseBody,
            redirectUrl: rule.redirectUrl,
            action: rule.action,
            reason: `Terminated by rule: ${rule._id}`,
          };
        }
      }

      return { shouldTerminate: false };
    } catch (error) {
      logger.error('Termination check error:', error);
      return { shouldTerminate: false };
    }
  }

  /**
   * Evaluate conditions for a termination rule
   * @param {Object} req - Express request
   * @param {Array} conditions - Array of conditions
   * @returns {boolean} All conditions match
   */
  evaluateConditions(req, conditions) {
    if (!conditions || conditions.length === 0) {
      return false;
    }

    for (const condition of conditions) {
      if (!this.evaluateCondition(req, condition)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate a single condition
   * @param {Object} req - Express request
   * @param {Object} condition - Condition to evaluate
   * @returns {boolean} Condition matches
   */
  evaluateCondition(req, condition) {
    const { field, operator, value, headerName } = condition;

    let actualValue;

    switch (field) {
      case 'ip':
        actualValue = req.ip;
        break;
      case 'user-agent':
        actualValue = req.get('user-agent');
        break;
      case 'header':
        actualValue = req.get(headerName);
        break;
      case 'path':
        actualValue = req.path;
        break;
      case 'method':
        actualValue = req.method;
        break;
      case 'query-param':
        actualValue = req.query[headerName];
        break;
      case 'request-size':
        actualValue = req.get('content-length') || 0;
        break;
      case 'country':
        actualValue = req.geoLocation?.country;
        break;
      default:
        return false;
    }

    return this.compareValues(actualValue, operator, value);
  }

  /**
   * Compare values based on operator
   * @param {*} actual - Actual value
   * @param {string} operator - Comparison operator
   * @param {*} expected - Expected value
   * @returns {boolean} Comparison result
   */
  compareValues(actual, operator, expected) {
    if (actual === undefined || actual === null) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not-equals':
        return actual !== expected;
      case 'contains':
        return String(actual).toLowerCase().includes(String(expected).toLowerCase());
      case 'not-contains':
        return !String(actual).toLowerCase().includes(String(expected).toLowerCase());
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not-in':
        return Array.isArray(expected) && !expected.includes(actual);
      case 'matches':
        return new RegExp(expected).test(actual);
      case 'greater-than':
        return Number(actual) > Number(expected);
      case 'less-than':
        return Number(actual) < Number(expected);
      default:
        return false;
    }
  }

  /**
   * Create termination rule
   * @param {Object} ruleData - Rule data
   * @returns {Object} Created rule
   */
  async createRule(ruleData) {
    try {
      return await TerminationRule.create(ruleData);
    } catch (error) {
      logger.error('Create termination rule error:', error);
      throw error;
    }
  }

  /**
   * Get termination rules for a route
   * @param {string} routeId - Route ID
   * @returns {Array} Termination rules
   */
  async getRulesForRoute(routeId) {
    try {
      return await TerminationRule.find({ routeId }).sort({ priority: -1 });
    } catch (error) {
      logger.error('Get termination rules error:', error);
      return [];
    }
  }
}

module.exports = new TerminationService();
