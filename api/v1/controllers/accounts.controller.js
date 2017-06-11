'use strict';
const debug = require('debug')('account-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;

const AccountService = require(appRoot + '/libs/services/accountService').AccountService;
const Validator = require(appRoot + '/api/v1/validators/account.validator');

const saveAccount = (app) => {
  return (req, res) => {
    let account = req.body;

    // Save it
    let accountService = new AccountService();
    let validator = new Validator();

    account = validator.sanitize(account);

    validator.validateNewAccount(req).then((result) => {
      if (!result.isEmpty()) {
        throw ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request - Save Account', result.array());
      } else {
        return accountService.findAccountByAccountNumber(account.accountNumber);
      }
    }).then((foundAccount) => {
      if (foundAccount) {
        throw new ServiceError(HttpStatus.CONFLICT, 'Account already exists').writeResponse(res);
      } else {
        return accountService.saveAccount(account);
      }
    }).then((savedAccount) => {
      res.status(HttpStatus.CREATED).send(savedAccount);
    }).catch((err) => {
      if (err instanceof ServiceError)
        err.writeResponse(res);
      else
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  };
};

const updateAccount = (app) => {
  return (req, res) => {
    let account = req.body;

    // Update it
    let accountService = new AccountService();
    let validator = new Validator();

    account = validator.sanitize(account);

    validator.validateAccount(req).then((result) => {
      if (!result.isEmpty()) {
        throw ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request - Update Account', result.array());
      } else {
        return accountService.findAccountById(account.id);
      }
    }).then((foundAccount) => {
      if (foundAccount) {
        return accountService.updateAccount(account);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Account not found');
      }
    }).then((updatedAccount) => {
      res.status(HttpStatus.OK).send(updatedAccount);
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const getAccount = (app) => {
  return (req, res) => {
    let id = req.params.id;

    let accountService = new AccountService();

    accountService.findAccountById(id).then((acct) => {
      if (acct) {
        res.status(HttpStatus.OK).send(acct);
      } else {
        new ServiceError(HttpStatus.NOT_FOUND, 'Account not found').writeResponse(res);
      }
    }).catch((err) => {
      new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  };
};

module.exports.saveAccount = saveAccount;
module.exports.updateAccount = updateAccount;
module.exports.getAccount = getAccount;
