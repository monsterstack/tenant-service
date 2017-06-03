'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newTenantEntry = require('./utils').newTenantEntry;
const MongoHelper = require('./utils').MongoHelper;

/**
 * Verify Update Tenant is 'Ok'
 * @param {*} done
 */
const verifyUpdateTenantOk = (done) => {
  return (response) => {
    if (response.obj && response.status == HttpStatus.OK) {
			console.log(response.obj);
      assert.assertFieldExists('id', response.obj, 'Expected tenant.id exists');
      assert.assertFieldExists('name', response.obj, 'Expected tenant.name exists');
      assert.assertFieldExists('status', response.obj, 'Expected tenant.status exists');
      assert.assertFieldExists('apiKey', response.obj, 'Expected tenant.apiKey exists');
      assert.assertFieldExists('apiSecret', response.obj, 'Expected tenant.apiSecret exists');
      assert.assertFieldExists('services', response.obj, 'Expected tenant.services exists');
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

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    let mongoHelper = new MongoHelper('tenants', tenantUrl);

    mongoHelper.saveObject(tenantEntry).then((saved) => {
      tenantEntry.id = saved._id.toString();
			debugger;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('should return 200 on update', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
			debugger;
      let request = { 'x-fast-pass': true, tenant: tenantEntry };
      debugger;
      service.api.tenants.updateTenant(request, verifyUpdateTenantOk(done), verifyUpdateTenantMissingError(done));
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
