const jp = require('jsonpath');
const _ = require('lodash');

class TransformationService {
  /**
   * Transform request based on rules
   * @param {Object} req - Express request
   * @param {Array} rules - Transformation rules
   * @returns {Object} Transformed request
   */
  transformRequest(req, rules) {
    const transformedReq = {
      headers: { ...req.headers },
      body: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
      path: req.path,
      query: { ...req.query },
    };

    for (const rule of rules) {
      if (!rule.active || rule.type !== 'request') continue;

      for (const action of rule.actions) {
        this.applyTransformation(transformedReq, action);
      }
    }

    return transformedReq;
  }

  /**
   * Transform response based on rules
   * @param {Object} res - Express response
   * @param {Object} responseData - Response data
   * @param {Array} rules - Transformation rules
   * @returns {Object} Transformed response
   */
  transformResponse(responseData, rules) {
    const transformedRes = {
      headers: { ...responseData.headers },
      body: responseData.body ? JSON.parse(JSON.stringify(responseData.body)) : null,
      statusCode: responseData.statusCode,
    };

    for (const rule of rules) {
      if (!rule.active || rule.type !== 'response') continue;

      for (const action of rule.actions) {
        this.applyResponseTransformation(transformedRes, action);
      }
    }

    return transformedRes;
  }

  /**
   * Apply transformation action to request
   * @param {Object} req - Request object
   * @param {Object} action - Transformation action
   */
  applyTransformation(req, action) {
    const { operation, target, value } = action;

    switch (operation) {
      case 'add-header':
        req.headers[target.toLowerCase()] = value;
        break;

      case 'remove-header':
        delete req.headers[target.toLowerCase()];
        break;

      case 'modify-header':
        if (req.headers[target.toLowerCase()]) {
          req.headers[target.toLowerCase()] = value;
        }
        break;

      case 'add-body-field':
        if (req.body && action.jsonPath) {
          jp.apply(req.body, action.jsonPath, () => value);
        }
        break;

      case 'remove-body-field':
        if (req.body && action.jsonPath) {
          jp.apply(req.body, action.jsonPath, () => undefined);
        }
        break;

      case 'transform-body':
        if (req.body && action.jsonPath && action.replacement) {
          const nodes = jp.nodes(req.body, action.jsonPath);
          for (const node of nodes) {
            node.value = action.replacement;
          }
        }
        break;

      case 'rewrite-path':
        if (action.regex && action.replacement) {
          req.path = req.path.replace(new RegExp(action.regex), action.replacement);
        }
        break;

      case 'add-query-param':
        req.query[target] = value;
        break;

      case 'remove-query-param':
        delete req.query[target];
        break;
    }
  }

  /**
   * Apply transformation action to response
   * @param {Object} res - Response object
   * @param {Object} action - Transformation action
   */
  applyResponseTransformation(res, action) {
    const { operation, target, value } = action;

    switch (operation) {
      case 'add-header':
        res.headers[target.toLowerCase()] = value;
        break;

      case 'remove-header':
        delete res.headers[target.toLowerCase()];
        break;

      case 'modify-header':
        if (res.headers[target.toLowerCase()]) {
          res.headers[target.toLowerCase()] = value;
        }
        break;

      case 'transform-body':
        if (res.body && action.jsonPath && action.replacement) {
          const nodes = jp.nodes(res.body, action.jsonPath);
          for (const node of nodes) {
            node.value = action.replacement;
          }
        }
        break;

      case 'add-body-field':
        if (res.body && action.jsonPath) {
          jp.apply(res.body, action.jsonPath, () => value);
        }
        break;

      case 'remove-body-field':
        if (res.body && action.jsonPath) {
          jp.apply(res.body, action.jsonPath, () => undefined);
        }
        break;
    }
  }

  /**
   * Mask PII in response body
   * @param {Object} body - Response body
   * @param {Array} fieldsToMask - Fields to mask
   * @returns {Object} Masked body
   */
  maskPII(body, fieldsToMask) {
    if (!body || typeof body !== 'object') return body;

    const masked = JSON.parse(JSON.stringify(body));

    for (const field of fieldsToMask) {
      if (jp.value(masked, field)) {
        jp.apply(masked, field, () => '***REDACTED***');
      }
    }

    return masked;
  }
}

module.exports = new TransformationService();
