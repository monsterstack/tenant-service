'use strict';
const md5 = require('md5');
const Validator = require('core-server').Validator;

class UserValidator extends Validator {
  constructor() {
    super();
  }

  sanitize(user, isNew) {
    if (isNew === true) {
      // Hash password
      if (user.password) {
        user.password = md5(user.password);
      }
    }

    if (user.locale === undefined)
     user.locale = 'en-US';

    return user;
  }

  validateNewUser(req, locale) {
    if (locale === undefined)
      locale = 'en-US';
    req.checkBody('username', 'Invalid username').notEmpty().isAlpha();
    req.checkBody('password', 'Missing password').notEmpty().isMD5();
    req.checkBody('firstname', 'Missing firstname').notEmpty();
    req.checkBody('lastname', 'Missing lastname').notEmpty();
    req.checkBody('accountId', 'Invalid accountId').notEmpty().isMongoId();
    req.checkBody('tenantId', 'Invalid tenantId').notEmpty().isMongoId();
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('phoneNumber', 'Invalid phone number').notEmpty().isMobilePhone(locale);
    return req.getValidationResult();
  }

  validateUser(req, locale) {
    req.checkBody('id', 'Invalid Id').notEmpty().isMongoId();
    return this.validateNewUser(req, locale);
  }
}

module.exports = UserValidator;
