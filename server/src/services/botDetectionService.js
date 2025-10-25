const logger = require('../utils/logger');

class BotDetectionService {
  /**
   * Analyze request for bot patterns
   * @param {Object} req - Express request
   * @param {Object} rule - Bot detection rule
   * @returns {Object} Detection result
   */
  analyzeRequest(req, rule) {
    const result = {
      isBot: false,
      reason: null,
      confidence: 0,
      patterns: [],
    };

    try {
      const userAgent = req.get('user-agent') || '';
      const detectedPatterns = [];

      // Check user-agent patterns
      if (rule.patterns && rule.patterns.length > 0) {
        for (const pattern of rule.patterns) {
          if (pattern.type === 'user-agent') {
            const regex = new RegExp(pattern.pattern, 'i');
            if (regex.test(userAgent)) {
              detectedPatterns.push({
                type: 'user-agent',
                pattern: pattern.pattern,
                action: pattern.action,
              });
              result.confidence += pattern.action === 'block' ? 50 : -20;
            }
          }
        }
      }

      // Check for legitimate bots (whitelist)
      if (rule.whitelist && rule.whitelist.some(bot => userAgent.includes(bot))) {
        result.isBot = false;
        result.reason = 'Whitelisted bot';
        return result;
      }

      // Behavioral analysis
      const missingHeaders = this.checkMissingHeaders(req);
      if (missingHeaders.length > 0) {
        detectedPatterns.push({
          type: 'behavior',
          pattern: 'missing-headers',
          missingHeaders,
        });
        result.confidence += missingHeaders.length * 15;
      }

      // Check for suspicious patterns
      if (this.hasSuspiciousPatterns(userAgent, req)) {
        detectedPatterns.push({
          type: 'behavior',
          pattern: 'suspicious-patterns',
        });
        result.confidence += 30;
      }

      result.patterns = detectedPatterns;
      
      // Determine if it's a bot based on confidence and sensitivity
      const threshold = this.getThreshold(rule.sensitivity);
      result.isBot = result.confidence >= threshold;
      result.reason = result.isBot ? detectedPatterns[0]?.pattern || 'Bot detected' : 'Legitimate';
      result.confidence = Math.min(100, result.confidence);

    } catch (error) {
      logger.error('Bot detection error:', error);
    }

    return result;
  }

  /**
   * Check for missing standard headers
   * @param {Object} req - Express request
   * @returns {string[]} Missing headers
   */
  checkMissingHeaders(req) {
    const standardHeaders = ['accept', 'accept-language', 'accept-encoding'];
    const missing = [];

    for (const header of standardHeaders) {
      if (!req.get(header)) {
        missing.push(header);
      }
    }

    return missing;
  }

  /**
   * Check for suspicious patterns in user agent
   * @param {string} userAgent - User agent string
   * @param {Object} req - Express request
   * @returns {boolean} Has suspicious patterns
   */
  hasSuspiciousPatterns(userAgent, req) {
    // Empty or very short user agent
    if (!userAgent || userAgent.length < 10) {
      return true;
    }

    // Common bot patterns
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /^[a-z]+$/i, // All lowercase or uppercase
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent) && !userAgent.match(/googlebot|bingbot/i)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get detection threshold based on sensitivity
   * @param {string} sensitivity - low, medium, high
   * @returns {number} Threshold value
   */
  getThreshold(sensitivity) {
    const thresholds = {
      low: 80,
      medium: 60,
      high: 40,
    };

    return thresholds[sensitivity] || 60;
  }

  /**
   * Get recommended action based on detection result
   * @param {Object} result - Detection result
   * @param {Object} rule - Bot detection rule
   * @returns {string} Recommended action
   */
  getRecommendedAction(result, rule) {
    if (!result.isBot) {
      return 'allow';
    }

    // Find matching pattern action
    for (const pattern of result.patterns) {
      if (pattern.action) {
        return pattern.action;
      }
    }

    // Default action based on confidence
    if (result.confidence >= 80) {
      return 'block';
    } else if (result.confidence >= 50) {
      return 'challenge';
    } else {
      return 'rate-limit';
    }
  }
}

module.exports = new BotDetectionService();
