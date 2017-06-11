'use strict';
const Validator = require('core-server').Validator;

class AccountValidator extends Validator {
  constructor() {
    super();
  }

  sanitize(account, isNew) {
    return account;
  }

  validateNewAccount(req, locale) {
    req.checkBody('accountNumber', 'Invalid Account Number').notEmpty().isUUID();
    req.checkBody('tenantId', 'Invalid tenant id').notEmpty().isMongoId();
    return req.getValidationResult();
  }

  validateAccount(req, locale) {
    super.checkEntityId(req);
    return this.validateNewAccount(req, locale);
  }
}

module.exports = AccountValidator;
