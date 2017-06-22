'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const TokenTestHelper = require('service-test-helpers').TokenTestHelper;
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newApplicationEntry = require('data-test-helpers').newApplicationEntry;
const newApplicationEntryMissingName = require('data-test-helpers').newApplicationEntryMissingName;
const newApplicationEntryMissingScope = require('data-test-helpers').newApplicationEntryMissingScope;
const newApplicationEntryMissingStatus = require('data-test-helpers').newApplicationEntryMissingStatus;
const newApplicationEntryMissingAccountId = require('data-test-helpers').newApplicationEntryMissingAccountId;
const newApplicationEntryMissingTenantId = require('data-test-helpers').newApplicationEntryMissingTenantId;

const newTenantEntry = require('data-test-helpers').newTenantEntry;
const newAccountEntry = require('data-test-helpers').newAccountEntry;

const MongoHelper = require('data-test-helpers').MongoHelper;

const verifyUpdateApplicationOk = (done) => {
  return (response) => {
    if (response.obj && response.status === HttpStatus.OK) {
      assert.assertFieldExists('tenantName', response.obj, `Expected application.tenantName exists`);
      assert.assertFieldExists('apiKey', response.obj, `Expected application.apiKey exists`);
      assert.assertFieldExists('apiSecret', response.obj, `Expected application.apiSecret exists`);
      assert.assertFieldExists('scope', response.obj, `Expected application.scope exists`);
      assert.assertFieldExists('accountId', response.obj, `Expected application.accountId exists`);
      assert.assertFieldExists('tenantId', response.obj, `Expected application.tenantId exists`);
      assert.assertFieldExists('timestamp', response.obj, `Expected application.timestamp exists`);

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

const verifyUpdateBadRequest = (done) => {
  return (err) => {
    assert.assertEquals(err.status, HttpStatus.BAD_REQUEST, `Expected 400 - Bad Request`);
    assert.assertFieldExists('errorMessage', err.obj, `Expected error.errorMessage exists`);
    assert.assertFieldExists('violations', err.obj, `Expected error.violations exists`);
    done();
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
  let applicationEntryMissingName = newApplicationEntryMissingName();
  let applicationEntryMissingScope = newApplicationEntryMissingScope();
  let applicationEntryMissingStatus = newApplicationEntryMissingStatus();
  let applicationEntryMissingAccountId = newApplicationEntryMissingAccountId();
  let applicationEntryMissingTenantId = newApplicationEntryMissingTenantId();

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

  it('should return 400 on put application - missing name', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, application: applicationEntryMissingName };
      service.api.applications.updateApplication(request, verifyUpdateMissingSuccess(done), verifyUpdateBadRequest(done));
    });
  });

  it('should return 400 on put application - missing scope', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, application: applicationEntryMissingScope };
      service.api.applications.updateApplication(request, verifyUpdateMissingSuccess(done), verifyUpdateBadRequest(done));
    });
  });

  it('should return 400 on put application - missing status', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, application: applicationEntryMissingStatus };
      service.api.applications.updateApplication(request, verifyUpdateMissingSuccess(done), verifyUpdateBadRequest(done));
    });
  });

  after((done) => {
    clearTenantDB((err) => {
      if (err) done(err);
      else done();
    });
  });
});

