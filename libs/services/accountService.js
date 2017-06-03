'use strict';
const model = require('tenant-model').model;

class AccountService {

  findAccountById(id) {
    return model.findAccount(id);
  }

  findAccountByAccountNumber(accountNumber) {
    return model.findAccountByAccountNumber(accountNumber);
  }

  saveAccount(account) {
    return model.saveAccount(account);
  }
}

module.exports.AccountService = AccountService;
