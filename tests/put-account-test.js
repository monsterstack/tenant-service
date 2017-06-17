'use strict';
const HttpStatus = require('http-status');
const config = require('config');

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const MongoHelper = require('data-test-helpers').MongoHelper;
const newAccountEntry = require('data-test-helpers').newAccountEntry;
const newTenantEntry = require('data-test-helpers').newTenantEntry;
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
  let accountMongoHelper = new MongoHelper('accounts', tenantUrl);
  let tenantMongoHelper = new MongoHelper('tenants', tenantUrl);

  let accountEntry = newAccountEntry();
  let tenantEntry = newTenantEntry();

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    tenantMongoHelper.saveObject(tenantEntry).then((savedTenant) => {
      accountEntry.tenantId = savedTenant._id.toString();
      return accountMongoHelper.saveObject(accountEntry);
    }).then((saved) => {
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

