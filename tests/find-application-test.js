'use strict';
const uuid = require('node-uuid');
const HttpStatus = require('http-status');
const ApiBinding = require('discovery-proxy').ApiBinding;
const MongoHelper = require('./utils').MongoHelper;
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newApplicationEntry = require('./utils').newApplicationEntry;
const newSecurityDescriptor = require('./utils').newSecurityDescriptor;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;

const verifyGetApplicationResponseOk = (expected, done) => {
  return (response) => {
    if (response.obj && response.status === HttpStatus.OK) {
      assert.assertFieldExists('id', response.obj, 'Expected application.id to exist');
      assert.assertFieldExists('name', response.obj, 'Expected application.name to exist');
      assert.assertFieldExists('apiKey', response.obj, 'Expected application.apiKey to exist');
      assert.assertFieldExists('apiSecret', response.obj, 'Expected application.apiSecret to exist');
      assert.assertFieldExists('scope', response.obj, 'Expected application.scope to exist');
      assert.assertFieldExists('tenantId', response.obj, 'Expected application.tenantId to exist');
      assert.assertFieldExists('accountId', response.obj, 'Expected application.accountId to exist');
      assert.assertFieldExists('status', response.obj, 'Expected application.status to exist');

      assert.assertEquals(response.obj.name, expected.name, `Expected application.name is ${expected.name}`);
      assert.assertEquals(response.obj.status, expected.status, `Expected application.status is ${expected.status}`);
      assert.assertEquals(response.obj.scope.length, expected.scope.length, `Expected application.scope.length is ${expected.scope.length}`);
      assert.assertEquals(response.obj.tenantId, expected.tenantId, `Expected application.tenantId is ${expected.tenantId}`);
      assert.assertEquals(response.obj.accountId, expected.accountId, `Expected application.accountId is ${expected.accountId}`);
      assert.assertEquals(response.obj.apiKey, expected.apiKey, `Expected application.apiKey is ${expected.apiKey}`);
      assert.assertEquals(response.obj.apiSecret, expected.apiSecret, `Expected application.apiSecret is ${expected.apiSecret}`);
      done();
    } else {
      done(new Error('Expected Application Response Obj'));
    }
  };
};

const verifyGetApplicationsResponseOk = (done) => {
  return (response) => {
    if (response.obj && response.obj.page && response.status === HttpStatus.OK) {
      done();
    } else {
      done('Expecting response with OK');
    }
  };
};

const verifyGetApplicationResponseMissing = (done) => {
  return (response) => {
    done(new Error('Expecting null response'));
  };
};

const verifyGetApplicationErrorMissing = (done) => {
  return (err) => {
    done(err);
  };
};

const verifyGetApplicationNotFoundExists = (done) => {
  return (err) => {
    if (err.status === HttpStatus.NOT_FOUND) {
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

describe('find-application-test', () => {
  let tenantService;
  let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);

  let applicationEntry = newApplicationEntry('clientId', 'clientSecret');
  let serviceTestHelper = new ServiceTestHelper();

  before((done) => {
    // Start Tenant Service
    let mongoHelper = new MongoHelper('applications', 'mongodb://localhost:27017/cdspTenant');
    mongoHelper.saveObject(applicationEntry).then((result) => {
      applicationEntry._id = result._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
        tenantService = service;
        done();
      }).catch((err) => {
        done(err);
      });
  });

  it('should find one application by apiKey', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, apiKey: applicationEntry.apiKey };
      service.api.applications.getApplicationByApiKey(
        query, verifyGetApplicationResponseOk(applicationEntry, done), verifyGetApplicationErrorMissing(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('should find one application by id', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, id: applicationEntry._id };
      service.api.applications.getApplication(
        query, verifyGetApplicationResponseOk(applicationEntry, done), verifyGetApplicationErrorMissing(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('should fail with 404 - NOT FOUND when finding application by unknown id', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let unknownApplicationId = '58a98bad624702214a6e2ba7';
      let query = { 'x-fast-pass': true, id: unknownApplicationId };
      service.api.applications.getApplication(query, verifyGetApplicationResponseMissing(done), verifyGetApplicationNotFoundExists(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 - BAD REQUEST on find application with malformed id', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, id: 'dfdfsdfdsf' };
      service.api.applications.getApplication(query, verifyGetApplicationResponseMissing(done), verifyBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('should find applications', (done) => {
      serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
        let query = { 'x-fast-pass': true };
        service.api.applications.getApplications(query, verifyGetApplicationsResponseOk(done), verifyGetApplicationErrorMissing(done));
      }).catch((err) => {
        done(err);
      });
    });

});
