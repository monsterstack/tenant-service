'use strict';

const HttpStatus = require('http-status');
const ApiBinding = require('discovery-proxy').ApiBinding;
const MongoHelper = require('data-test-helpers').MongoHelper;
const newTenantEntry = require('data-test-helpers').newTenantEntry;
const newSecurityDescriptor = require('data-test-helpers').newSecurityDescriptor;

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;
const uuid = require('node-uuid');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const verifyGetTenantResponseOk = (expected, done) => {
  return (response) => {
    if (response.obj && response.status === HttpStatus.OK) {
      assert.assertFieldExists('id', response.obj, 'Expected tenant.id to exist');
      assert.assertFieldExists('name', response.obj, 'Expected tenant.name to exist');
      assert.assertFieldExists('apiKey', response.obj, 'Expected tenant.apiKey to exist');
      assert.assertFieldExists('apiSecret', response.obj, 'Expected tenant.apiSecret to exist');
      assert.assertFieldExists('services', response.obj, 'Expected tenant.services to exist');
      assert.assertFieldExists('status', response.obj, 'Expected tenant.status to exist');

      assert.assertEquals(response.obj.name, expected.name, `Expected tenant.name to be ${expected.name}`);
      assert.assertEquals(response.obj.apiKey, expected.apiKey, `Expected tenant.apiKey to be ${expected.apiKey}`);
      assert.assertEquals(response.obj.apiSecret, expected.apiSecret, `Expected tenant.apiSecret to be ${expected.apiSecret}`);
      assert.assertEquals(response.obj.services.length, expected.services.length,
          `Expected tenant.services.length to be ${expected.services.length}`);
      assert.assertEquals(response.obj.status, expected.status, `Expected tenant.status to be ${expected.status}`);

      done();
    } else
      done(new Error('Expected Response to containe `obj`'));
  };
};

const verifyGetTenantResponseMissing = (done) => {
  return (response) => {
    if (response) {
      done(new Error('Expecing no response'));
    } else {
      done();
    }
  };
};

const verifyGetTenantsResponseOk = (done) => {
  return (response) => {
    if (response.status === HttpStatus.OK) {
      if (response.obj.page) {
        done();
      } else {
        done(new Error(`Expecting body with page field`));
      }
    } else {
      done(new Error(`Expecting http status 200, received ${tenant.status}`));
    }
  };
};

const verifyGetTenantErrorMissing = (done) => {
  return (err) => {
    done(err);
  };
};

const verifyTenantNotFoundErrorExists = (done) => {
  return (err) => {
    if (err.status === 404) {
      done();
    } else {
      done(new Error(`Expected http status 404, received ${tenant.status}`));
    }
  };
};

const verifyBadRequest = (done) => {
  return (err) => {
    if (err.status === HttpStatus.BAD_REQUEST) {
      done();
    } else {
      done(new Error(`Expected http status 400, received ${err.status}`));
    }
  };
};

describe('find-tenant', () => {
    let tenantService = null;
    let tenantUrl = 'mongodb://localhost:27017/cdspTenant';

    let clientId = uuid.v1();
    let clientSecret = jwt.sign(clientId, 'shhhhh!');

    let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);
    let tenantEntry = newTenantEntry(clientId, clientSecret);
    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

    let serviceTestHelper = new ServiceTestHelper();

    /**
     * Prepare the Test Suite
     */
    before((done) => {
        let mongoHelper = new MongoHelper('tenants', tenantUrl);
        tenantEntry.apiKey = '223232323';
        mongoHelper.saveObject(tenantEntry).then((result) => {
          tenantEntry._id = result._id;
          return serviceTestHelper.startTestService('TenantService', {});
        }).then((service) => {
            tenantService = service;
            done();
          }).catch((err) => {
            done(err);
          });
      });

    it('should find tenant by id', (done) => {
        serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
            if (service) {
              let query = { 'x-fast-pass': true, id: tenantEntry._id };

              // Get Tenant
              service.api.tenants.getTenant(query, verifyGetTenantResponseOk(tenantEntry, done), verifyGetTenantErrorMissing(done));
            } else {
              done(new Error('Tenant Service Not Found'));
            }
          });
      });

    it('should find tenant by apiKey', (done) => {
        serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
            if (service) {
              let query = { 'x-fast-pass': true, apiKey: tenantEntry.apiKey };

              // Get Tenant
              service.api.tenants.getTenantByApiKey(query, verifyGetTenantResponseOk(tenantEntry, done), verifyGetTenantErrorMissing(done));
            } else {
              done(new Error('Tenant Service Not Found'));
            }
          });
      });

    it('should return 400 - Bad Request when finding by malformed id', (done) => {
      let malformedId = 'dfafe';
      serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
        let query = { 'x-fast-pass': true, id: malformedId };
        service.api.tenants.getTenant(query, verifyGetTenantResponseMissing(done), verifyBadRequest(done));
      }).catch((err) => {
        done(err);
      });
    });

    it('should Fail with 404 when finding tenant by unknown id', (done) => {
        let unknownTenantId = '58a98bad624702214a6e2ba7';
        serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
            if (service) {
              debugger;
              let query = { 'x-fast-pass': true, id: unknownTenantId };
              service.api.tenants.getTenant(query, verifyGetTenantResponseMissing(done), verifyTenantNotFoundErrorExists(done));
            } else {
              done(new Error('Missing Tenant Service'));
            }
          });
      });

    it('should find tenants', (done) => {
        serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
            if (service) {
              let query = { 'x-fast-pass': true };
              service.api.tenants.getTenants(query, verifyGetTenantsResponseOk(done), verifyGetTenantErrorMissing(done)
              );
            } else {
              done(new Error('Missing Tenant Service'));
            }
          });
      });

    /**
     * Clean up
     */
    after((done) => {
        clearTenantDB((err) => {
            if (err) done(err);
            else done();
          });
      });
  });
