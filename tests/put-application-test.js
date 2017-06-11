'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const TokenTestHelper = require('service-test-helpers').TokenTestHelper;
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newApplicationEntry = require('./utils').newApplicationEntry;
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
  let serviceTestHelper = new ServiceTestHelper();
  let mongoHelper = new MongoHelper('applications', tenantUrl);

  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    mongoHelper.saveObject(applicationEntry).then((saved) => {
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

