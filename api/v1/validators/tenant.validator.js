'use strict';
const Validator = require('core-server').Validator;

class TenantValidator extends Validator {
  constructor() {
    super();
  }

  sanitize(tenant, isNew) {
    if (isNew === true) {
      if (tenant.apiKey === undefined) {
        tenant.apiKey = uuid.v1();
      }
    }

    return tenant;
  }

  validateNewTenant(req) {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('services', 'Services are required').notEmpty();
    req.checkBody('status', 'Status is required').notEmpty();
    req.checkBody('apiKey', 'Invalid Api Key').isUUID();

    return req.getValidationResult();
  }

  validateApiKeyQuery(req) {
    req.checkParams('apiKey', 'Api Key is required').notEmpty();
    return req.getValidationResult();
  }

  validateTenant(req) {
    super.checkEntityId(req);
    req.checkBody('apiSecret', 'Api Secret is required').notEmpty();
    return this.validateNewTenant(req);
  }
}

module.exports = TenantValidator;
