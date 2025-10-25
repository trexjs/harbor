const geoip = require('geoip-lite');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class GeoLocationService {
  constructor() {
    this.redis = getRedisClient();
    this.cacheTTL = 86400; // 24 hours
  }

  /**
   * Get country information from IP address
   * @param {string} ip - IP address
   * @returns {Object} Country information
   */
  async getCountryFromIP(ip) {
    try {
      // Check Redis cache first
      if (this.redis) {
        const cached = await this.redis.get(`geo:${ip}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Get geo location from geoip-lite
      const geo = geoip.lookup(ip);

      const result = {
        country: geo?.country || 'Unknown',
        region: geo?.region || 'Unknown',
        city: geo?.city || 'Unknown',
        latitude: geo?.ll?.[0] || null,
        longitude: geo?.ll?.[1] || null,
        timezone: geo?.timezone || null,
      };

      // Cache in Redis
      if (this.redis && geo) {
        await this.redis.setEx(
          `geo:${ip}`,
          this.cacheTTL,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      logger.error('Geo-location lookup error:', error);
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        latitude: null,
        longitude: null,
        timezone: null,
      };
    }
  }

  /**
   * Batch get countries for multiple IPs
   * @param {string[]} ips - Array of IP addresses
   * @returns {Object} Map of IP to country info
   */
  async getBatchCountriesFromIPs(ips) {
    const results = {};
    
    for (const ip of ips) {
      results[ip] = await this.getCountryFromIP(ip);
    }

    return results;
  }

  /**
   * Clear cached geo data for an IP
   * @param {string} ip - IP address
   */
  async clearCache(ip) {
    if (this.redis) {
      await this.redis.del(`geo:${ip}`);
    }
  }
}

module.exports = new GeoLocationService();
