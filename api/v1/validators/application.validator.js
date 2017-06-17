'use strict';
const Validator = require('core-server').Validator;

class ApplicationValidator extends Validator {
  constructor() {
    super();
  }

  sanitize(application, isNew) {
    if (isNew === true) {
      if (application.apiKey) {
        application.apiKey = null;
      }

      if (application.apiSecret) {
        application.apiSecret = null;
      }
    }

    return application;
  }

  validateNewApplication(req, locale) {
    if (locale === undefined)
       locale = 'en-US';
    req.checkBody('name', 'Name must be alphabetic').notEmpty().isAlpha(locale);
    req.checkBody('status', 'Status is missing').notEmpty();
    req.checkBody('tenantId', 'Tenant Id is invalid').notEmpty().isMongoId();
    req.checkBody('accountId', 'Account Id is invalid').notEmpty().isMongoId();
    req.checkBody('scope', 'Scope is missing').notEmpty();
    return req.getValidationResult();
  }

  validateApiKeyQuery(req) {
    req.checkParams('apiKey', 'Api Key is required').notEmpty();
    return req.getValidationResult();
  }

  validateApplication(req, locale) {
    req.checkBody('id', 'Invalid id').notEmpty().isMongoId();
    return this.validateNewApplication(req, locale);
  }
}

module.exports = ApplicationValidator;
