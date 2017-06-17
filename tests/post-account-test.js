'use strict';

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const MongoHelper = require('./utils').MongoHelper;
const newSecurityDescriptor = require('./utils').newSecurityDescriptor;
const newAccountEntry = require('./utils').newAccountEntry;
const newTenantEntry = require('./utils').newTenantEntry;

const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;

const verifySavedAccountResponse = (done) => {
  return (response) => {
    if (response.obj) {
      done();
    } else {
      done(new Error('Expecting saved account'));
    }
  };
};

const verifySavedAccountError = (done) => {
  return (error) => {
    done(error);
  };
};

describe('post-account-test', () => {
  let tenantService = null;
  let tenantUrl = 'mongodb://localhost:27017/cdspTenant';

  let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  let tenantMongoHelper = new MongoHelper('tenants', tenantUrl);
  let accountEntry = newAccountEntry();
  let tenantEntry = newTenantEntry();

  let serviceTestHelper = new ServiceTestHelper();

  before((done) => {
    console.log(tenantEntry);
    tenantMongoHelper.saveObject(tenantEntry).then((savedTenant) => {
      accountEntry.tenantId = savedTenant._id.toString();
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      tenantService.getApp().dependencies = { types: ['SecurityService'] };
      return sideLoadSecurityDescriptor(tenantService, securityDescriptor);
    }).then(() => {
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should save account', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, account: accountEntry };
      service.api.accounts.saveAccount(request, verifySavedAccountResponse(done), verifySavedAccountError(done));
    });
  });

  after((done) => {
    clearTenantDB((err) => {
      if (err) done(err);
      else done();
    });
  });
});
