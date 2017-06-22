'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('service-test-helpers').Assert;

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const MongoHelper = require('data-test-helpers').MongoHelper;

const newApplicationEntry = require('data-test-helpers').newApplicationEntry;
const newAccountEntry = require('data-test-helpers').newAccountEntry;
const newTenantEntry = require('data-test-helpers').newTenantEntry;

const newSecurityDescriptor = require('data-test-helpers').newSecurityDescriptor;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;

const verifySavedApplicationCreated = (done) => {
  return (response) => {
    if (response.obj && response.status === HttpStatus.CREATED) {
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
      done(new Error(`Expected 201 - Created`));
    }
  };
};

const verifyMissingSavedApplicationError = (done) => {
  return (error) => {
    done(error);
  };
};

describe('post-application', (done) => {
    let tenantService = null;
    let tenantUrl = 'mongodb://localhost:27017/cdspTenant';
    let applicationEntry = newApplicationEntry();
    let tenantEntry = newTenantEntry();
    let accountEntry = newAccountEntry();

    let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);
    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

    let tenantMongoHelper = new MongoHelper('tenants', tenantUrl);
    let accountMongoHelper = new MongoHelper('accounts', tenantUrl);

    let serviceTestHelper = new ServiceTestHelper();
    before((done) => {
      tenantMongoHelper.saveObject(tenantEntry).then((savedTenant) => {
        applicationEntry.tenantId = savedTenant._id.toString();
        return accountMongoHelper.saveObject(accountEntry);
      }).then((savedAccount) => {
        applicationEntry.accountId = savedAccount._id.toString();
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

    it('should save application', (done) => {
        serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
            debugger;
            if (service) {
              let request = { 'x-fast-pass': true, application: applicationEntry };
              service.api.applications.saveApplication(request, verifySavedApplicationCreated(done), verifyMissingSavedApplicationError(done));
            } else {
              done(new Error('Application Service Not Found'));
            }
          });
      });

    after((done) => {
        clearTenantDB((err) => {
            if (err) done(err);
            else done();
          });
      });
  });
