'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('assert');

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const MongoHelper = require('data-test-helpers').MongoHelper;

const newApplicationEntry = require('data-test-helpers').newApplicationEntry;
const newAccountEntry = require('data-test-helpers').newAccountEntry;
const newTenantEntry = require('data-test-helpers').newTenantEntry;

const newSecurityDescriptor = require('data-test-helpers').newSecurityDescriptor;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;

const verifySavedApplicationResponse = (done) => {
  return (response) => {
    if (response.obj) {
      done();
    } else {
      done(new Error('Expecting saved application'));
    }
  };
};

const verifySavedApplicationError = (done) => {
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
              service.api.applications.saveApplication(request, verifySavedApplicationResponse(done), verifySavedApplicationError(done));
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
