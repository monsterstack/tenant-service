'use strict';
const HttpStatus = require('http-status');
const config = require('config');

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const MongoHelper = require('./utils').MongoHelper;
const newAccountEntry = require('./utils').newAccountEntry;
const assert = require('service-test-helpers').Assert;

const verifyUpdateAccountOk = (expected, done) => {
  return (response) => {
    if (response.status === HttpStatus.OK && response.obj) {
      assert.assertFieldExists('id', response.obj, 'Expected account.id exists');
      assert.assertFieldExists('accountNumber', response.obj, 'Expected account.accountNumber exists');
      assert.assertEquals(response.obj.accountNumber, expected.accountNumber,
       `Expected ${response.obj.accountNumber} === ${expected.accountNumber}`);
      done();
    } else {
      done(new Error('Expected 200 Ok on update of account'));
    }
  };
};

const verifyUpdateAccountMissingError = (done) => {
  return (err) => {
    done(err);
  };
};

describe('put-account-test', () => {
  let tenantService = null;

  let tenantUrl = config.test.tenantDbUrl;
  let serviceTestHelper = new ServiceTestHelper();
  let mongoHelper = new MongoHelper('accounts', tenantUrl);

  let accountEntry = newAccountEntry();

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    mongoHelper.saveObject(accountEntry).then((saved) => {
      accountEntry.id = saved._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on update', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, account: accountEntry };
      service.api.accounts.updateAccount(request, verifyUpdateAccountOk(accountEntry, done), verifyUpdateAccountMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  after((done) => {
    clearTenantDB((err) => {
      if (err) done(err);
      else done();
    });
  });
});

