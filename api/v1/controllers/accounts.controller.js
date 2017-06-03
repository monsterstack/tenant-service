'use strict';
const debug = require('debug')('account-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;

const AccountService = require(appRoot + '/libs/services/accountService').AccountService;

const saveAccount = (app) => {
  return (req, res) => {
    let account = req.body;

    // Save it
    let accountService = new AccountService();

    accountService.findAccountByAccountNumber(account.accountNumber).then((foundAccount) => {
      if (foundAccount) {
        new ServiceError(HttpStatus.CONFLICT, 'Account already exists').writeResponse(res);
      } else {
        accountService.saveAccount(account).then((savedAccount) => {
          res.status(HttpStatus.CREATED).send(savedAccount);
        }).catch((err) => {
          new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
        });
      }
    }).catch((err) => {
      new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
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
module.exports.getAccount = getAccount;
