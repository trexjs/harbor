const IpBlockRule = require('../models/IpBlockRule');
const logger = require('../utils/logger');

class IpBlockingService {
  /**
   * Check if IP is blocked or allowed
   * @param {string} ip - IP address
   * @param {string} routeId - Route ID (optional)
   * @returns {Object} Block status
   */
  async checkIP(ip, routeId = null) {
    try {
      // Check for route-specific rules first
      if (routeId) {
        const routeRules = await IpBlockRule.find({
          routeId,
          active: true,
          $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
        });

        for (const rule of routeRules) {
          if (this.isIPInList(ip, rule.ips)) {
            return {
              blocked: rule.type === 'blacklist',
              allowed: rule.type === 'whitelist',
              reason: rule.reason,
              type: rule.type,
            };
          }
        }
      }

      // Check global rules (no routeId)
      const globalRules = await IpBlockRule.find({
        routeId: null,
        active: true,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      });

      for (const rule of globalRules) {
        if (this.isIPInList(ip, rule.ips)) {
          return {
            blocked: rule.type === 'blacklist',
            allowed: rule.type === 'whitelist',
            reason: rule.reason,
            type: rule.type,
          };
        }
      }

      return { blocked: false, allowed: false };
    } catch (error) {
      logger.error('IP blocking check error:', error);
      return { blocked: false, allowed: false };
    }
  }

  /**
   * Check if IP matches any IP in the list (supports CIDR)
   * @param {string} ip - IP address to check
   * @param {string[]} ipList - List of IPs/CIDR blocks
   * @returns {boolean} IP is in list
   */
  isIPInList(ip, ipList) {
    for (const entry of ipList) {
      if (entry.includes('/')) {
        // CIDR notation
        if (this.isIPInCIDR(ip, entry)) {
          return true;
        }
      } else {
        // Exact match
        if (ip === entry) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if IP is in CIDR block
   * @param {string} ip - IP address
   * @param {string} cidr - CIDR notation (e.g., "192.168.1.0/24")
   * @returns {boolean} IP is in CIDR
   */
  isIPInCIDR(ip, cidr) {
    try {
      const [network, prefixLength] = cidr.split('/');
      const prefix = parseInt(prefixLength, 10);

      const networkIP = this.ipToNumber(network);
      const ipNum = this.ipToNumber(ip);

      const mask = -1 << (32 - prefix);
      return (networkIP & mask) === (ipNum & mask);
    } catch (error) {
      logger.error('CIDR check error:', error);
      return false;
    }
  }

  /**
   * Convert IP address to number
   * @param {string} ip - IP address
   * @returns {number} IP as number
   */
  ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  }

  /**
   * Create or update IP block rule
   * @param {Object} ruleData - Rule data
   * @returns {Object} Created/updated rule
   */
  async createOrUpdateRule(ruleData) {
    try {
      return await IpBlockRule.create(ruleData);
    } catch (error) {
      logger.error('Create IP rule error:', error);
      throw error;
    }
  }

  /**
   * Block an IP immediately
   * @param {string} ip - IP address
   * @param {string} reason - Reason for blocking
   * @param {Date} expiresAt - Expiration time (optional)
   * @returns {Object} Blocked rule
   */
  async blockIP(ip, reason = 'Manual block', expiresAt = null) {
    try {
      const rule = await IpBlockRule.findOne({
        'ips': ip,
        type: 'blacklist',
      });

      if (rule) {
        rule.active = true;
        rule.reason = reason;
        if (expiresAt) rule.expiresAt = expiresAt;
        await rule.save();
        return rule;
      }

      return await IpBlockRule.create({
        type: 'blacklist',
        ips: [ip],
        reason,
        expiresAt,
        active: true,
      });
    } catch (error) {
      logger.error('Block IP error:', error);
      throw error;
    }
  }

  /**
   * Unblock an IP
   * @param {string} ip - IP address
   * @returns {boolean} Success
   */
  async unblockIP(ip) {
    try {
      await IpBlockRule.updateMany(
        { 'ips': ip, type: 'blacklist' },
        { $set: { active: false } }
      );
      return true;
    } catch (error) {
      logger.error('Unblock IP error:', error);
      throw error;
    }
  }

  /**
   * Get all active IP rules
   * @param {string} routeId - Route ID (optional)
   * @returns {Array} Active rules
   */
  async getActiveRules(routeId = null) {
    try {
      const query = {
        active: true,
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      };

      if (routeId) {
        query.routeId = routeId;
      } else {
        query.routeId = null;
      }

      return await IpBlockRule.find(query).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Get active rules error:', error);
      return [];
    }
  }
}

module.exports = new IpBlockingService();
