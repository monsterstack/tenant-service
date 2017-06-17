'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const TokenTestHelper = require('service-test-helpers').TokenTestHelper;
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newApplicationEntry = require('./utils').newApplicationEntry;
const newTenantEntry = require('./utils').newTenantEntry;
const newAccountEntry = require('./utils').newAccountEntry;

const MongoHelper = require('./utils').MongoHelper;

const verifyUpdateApplicationOk = (done) => {
  return (response) => {
    if (response.obj && response.status === HttpStatus.OK) {
      assert.assertFieldExists('apiKey', response.obj, 'Expected application.apiKey exists');

      // Make sure the secret has the Tenant Name
      let tokenTestHelper = new TokenTestHelper();
      let decoded = tokenTestHelper.decodeSecret(response.obj.apiKey, response.obj.apiSecret);
      assert.assertEquals(response.obj.name, decoded.name, `Expected ${response.obj.name} === ${decoded.name}`);
      assert.assertEquals('Application', decoded.scope, `Expected Application === ${decoded.scope}`);
      assert.assertEquals('x-cdsp-application', decoded.agent, `Expected x-cdsp-application === ${decoded.agent}`);
      assert.assertEquals('magic', decoded.auth, `Expected magic == ${decoded.auth}`);
      done();
    } else {
      done(new Error('Expected 200 response on put of application'));
    }
  };
};

const verifyUpdateMissingError = (done) => {
  return (err) => {
    done(err);
  };
};

describe('put-application-test', () => {
  let tenantService = null;
  let tenantUrl = config.test.tenantDbUrl;
  let applicationEntry = newApplicationEntry();
  let tenantEntry = newTenantEntry();
  let accountEntry = newAccountEntry();
  let serviceTestHelper = new ServiceTestHelper();
  let applicationMongoHelper = new MongoHelper('applications', tenantUrl);
  let accountMongoHelper = new MongoHelper('accounts', tenantUrl);
  let tenantMongoHelper = new MongoHelper('tenants', tenantUrl);

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    tenantMongoHelper.saveObject(tenantEntry).then((savedTenant) => {
      applicationEntry.tenantId = savedTenant._id.toString();
      return accountMongoHelper.saveObject(accountEntry);
    }).then((savedAccount) => {
      applicationEntry.accountId = accountEntry._id.toString();
      return applicationMongoHelper.saveObject(applicationEntry);
    }).then((saved) => {
      applicationEntry.id = saved._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should return 200 on put', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, application: applicationEntry };
      service.api.applications.updateApplication(request, verifyUpdateApplicationOk(done), verifyUpdateMissingError(done));
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

