'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('assert');

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const newApplicationEntry = require('./utils').newApplicationEntry;
const newSecurityDescriptor = require('./utils').newSecurityDescriptor;
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
    let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);
    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });
    let serviceTestHelper = new ServiceTestHelper();
    before((done) => {
      serviceTestHelper.startTestService('TenantService', {}).then((service) => {
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
