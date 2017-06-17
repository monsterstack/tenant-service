'use strict';

const debug = require('debug')('user-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;

const UserService = require(appRoot + '/libs/services/userService').UserService;
const TenantService = require(appRoot + '/libs/services/tenantService').TenantService;
const AccountService = require(appRoot + '/libs/services/accountService').AccountService;
const Validator = require(appRoot + '/api/v1/validators/user.validator.js');

const getUser = (app) => {
  return (req, res) => {
    let id = req.params.id;
    let userService = new UserService();
    let validator = new Validator();

    validator.validateIdQuery(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return userService.findUserById(id);
      }
    }).then((found) => {
      if (found) {
        res.status(HttpStatus.OK).send(found);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'User not found');
      }
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const saveUser = (app) => {
  return (req, res) => {
    let user = req.body;
    let validator = new Validator();
    let userService = new UserService();
    let tenantService = new TenantService();
    let accountService = new AccountService();

    user = validator.sanitize(user, true);

    validator.validateNewUser(req, user.locale).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantById(user.tenantId);
      }
    }).then((tenant) => {
      if (tenant) {
        return accountService.findAccountById(user.accountId);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found, unable to associate with user');
      }
    }).then((account) => {
      if (account) {
        return userService.findUserByUsername(user.username);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Account not found, unable to associate with user');
      }
    }).then((foundUser) => {
      if (foundUser) {
        throw new ServiceError(HttpStatus.CONFLICT, `User with username ${foundUser.username} already exists`);
      } else {
        return userService.saveUser(user);
      }
    }).then((saved) => {
      res.status(HttpStatus.CREATED).send(saved);
    }).catch((err) => {
      if (err instanceof ServiceError)
        err.writeResponse(res);
      else
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  };
};

const updateUser = (app) => {
  return (req, res) => {
    let user = req.body;
    let validator = new Validator();
    let userService = new UserService();
    let tenantService = new TenantService();
    let accountService = new AccountService();

    user = validator.sanitize(user, false);

    validator.validateUser(req, user.locale).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantById(user.tenantId);
      }
    }).then((tenant) => {
      if (tenant) {
        return accountService.findAccountById(user.accountId);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found, unable to associate with user');
      }
    }).then((account) => {
      if (account) {
        return userService.findUserById(user.id);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Account not found, unable to associate with user');
      }
    }).then((userToUpdate) => {
      if (userToUpdate) {
        return userService.updateUser(user);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'User not found for update').writeResponse(res);
      }
    }).then((updatedUser) => {
      res.status(HttpStatus.OK).send(updatedUser);
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

exports.saveUser = saveUser;
exports.updateUser = updateUser;
exports.getUser = getUser;
