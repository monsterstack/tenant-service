'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const MongoHelper = require('./utils').MongoHelper;
const SECURITY_PORT = 12616;

const newAccountEntry = require('./utils').newAccountEntry;
const newSecurityDescriptor = require('./utils').newSecurityDescriptor;

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const verifyGetAccountErrorMissing = (done) => {
  return (err) => {
    done(err);
  };
};

const verifyGetAccountResponseOk = (done) => {
  return (response) => {
    if (response.obj && response.status === HttpStatus.OK) {
      assert.assertFieldExists('id', response.obj, 'Expected account.id exists');
      assert.assertFieldExists('accountNumber', response.obj, 'Expected account.accountNumber exists');
      assert.assertFieldExists('tenantId', response.obj, 'Expected account.tenantId exists');
      done();
    } else {
      done(new Error('Expected 200 Ok'));
    }
  };
};

const verifyGetAccountResponseMissing = (done) => {
  return (response) => {
    done(new Error('Expected missing response'));
  };
};

const verifyGetAccountNotFoundErrorExists = (done) => {
  return (error) => {
    done();
  };
};

describe('find-account-test', () => {
  let tenantService = null;
  let tenantDbUrl = config.test.tenantDbUrl;

  let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);

  let accountEntry = newAccountEntry();

  let serviceTestHelper = new ServiceTestHelper();
  before((done) => {
    let mongoHelper = new MongoHelper('accounts', tenantDbUrl);

    mongoHelper.saveObject(accountEntry).then((result) => {
      accountEntry._id = result._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      sideLoadSecurityDescriptor(tenantService, securityDescriptor).then(() => {
          done();
        }).catch((err) => {
          done(err);
        });
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on getAccount', (done) => {
    let id = accountEntry._id;
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, id: id };
      service.api.accounts.getAccount(query, verifyGetAccountResponseOk(done), verifyGetAccountErrorMissing(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 404 on getAccount with unknown id', (done) => {
    let unknownId = '58a98bad624702214a6e2ba7';
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, id: unknownId };
      service.api.accounts.getAccount(query, verifyGetAccountResponseMissing(done), verifyGetAccountNotFoundErrorExists(done));
    }).catch((err) => {
      done(err);
    });
  });

});
