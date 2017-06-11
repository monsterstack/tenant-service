'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const TokenTestHelper = require('service-test-helpers').TokenTestHelper;
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newTenantEntry = require('./utils').newTenantEntry;
const MongoHelper = require('./utils').MongoHelper;

const uuid = require('node-uuid');
const changeField = require('./utils').changeField;

/**
 * Verify Update Tenant is 'Ok'
 * @param {*} done
 */
const verifyUpdateTenantOk = (expected, done) => {
  return (response) => {
    if (response.obj && response.status == HttpStatus.OK) {
      assert.assertFieldExists('id', response.obj, 'Expected tenant.id exists');
      assert.assertFieldExists('name', response.obj, 'Expected tenant.name exists');
      assert.assertFieldExists('status', response.obj, 'Expected tenant.status exists');
      assert.assertFieldExists('apiKey', response.obj, 'Expected tenant.apiKey exists');
      assert.assertFieldExists('apiSecret', response.obj, 'Expected tenant.apiSecret exists');
      assert.assertFieldExists('services', response.obj, 'Expected tenant.services exists');
      assert.assertFieldExists('timestamp', response.obj, 'Expected tenant.timestamp exists');

      assert.assertEquals(response.obj.status, expected.status, `Expected ${response.obj.status} === ${expected.status}`);
      assert.assertEquals(response.obj.services[0], expected.services[0], `Expected ${response.obj.services} === ${expected.services}`);

      // Make sure the secret has the Tenant Name
      let tokenTestHelper = new TokenTestHelper();
      let decoded = tokenTestHelper.decodeSecret(response.obj.apiKey, response.obj.apiSecret);
      assert.assertEquals('Tenant', decoded.scope, `Expected ${decoded.scope} === Tenant`);
      assert.assertEquals(response.obj.services[0], decoded.services[0], `Expected Service Count === ${decoded.services.length}`);
      assert.assertEquals(response.obj.apiKey, decoded.apiKey, `Expected ${response.obj.apiKey} === ${decoded.apiKey}`);
      done();
    } else {
      done(new Error('Expected Http Status 200'));
    }
  };
};

/**
 * Verify Update Tenant Did not error
 * @param {*} done
 */
const verifyUpdateTenantMissingError = (done) => {
  return (err) => {
    done(err);
  };
};

describe('put-tenant-test', () => {
  let tenantService = null;
  let tenantUrl = config.test.tenantDbUrl;
  let tenantEntry = newTenantEntry();
  let serviceTestHelper = new ServiceTestHelper();
  let tokenTestHelper = new TokenTestHelper();

  tenantEntry.apiKey = uuid.v1();
  tenantEntry.apiSecret = tokenTestHelper.codeSecret(tenantEntry, tenantEntry.apiKey);

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    let mongoHelper = new MongoHelper('tenants', tenantUrl);

    mongoHelper.saveObject(tenantEntry).then((saved) => {
      tenantEntry.id = saved._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should return 200 on update - name', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let tenantEntryToUpdate = changeField(tenantEntry.id, newTenantEntry(), 'name', 'Foobar');
      tenantEntryToUpdate.apiKey = uuid.v1();
      tenantEntryToUpdate.apiSecret = tokenTestHelper.codeTenantSecret(tenantEntryToUpdate);

      let request = { 'x-fast-pass': true, tenant: tenantEntryToUpdate };
      service.api.tenants.updateTenant(request, verifyUpdateTenantOk(tenantEntryToUpdate, done), verifyUpdateTenantMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('should return 200 on update - status', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let tenantEntryToUpdate = changeField(tenantEntry.id, newTenantEntry(), 'status', 'Tired');
      tenantEntryToUpdate.apiKey = uuid.v1();
      tenantEntryToUpdate.apiSecret = tokenTestHelper.codeTenantSecret(tenantEntryToUpdate);

      let request = { 'x-fast-pass': true, tenant: tenantEntryToUpdate };
      service.api.tenants.updateTenant(request, verifyUpdateTenantOk(tenantEntryToUpdate, done), verifyUpdateTenantMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('should return 200 on update - timestamp', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let tokenTestHelper = new TokenTestHelper();
      let tenantEntryToUpdate = changeField(tenantEntry.id, newTenantEntry(), 'timestamp', Date.now());
      tenantEntryToUpdate.apiKey = uuid.v1();
      tenantEntryToUpdate.apiSecret = tokenTestHelper.codeSecret(tenantEntryToUpdate, tenantEntryToUpdate.apiKey);

      let request = { 'x-fast-pass': true, tenant: tenantEntryToUpdate };
      service.api.tenants.updateTenant(request, verifyUpdateTenantOk(tenantEntryToUpdate, done), verifyUpdateTenantMissingError(done));
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
