'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;
const MongoHelper = require('data-test-helpers').MongoHelper;

const newUserEntry = require('data-test-helpers').newUserEntry;

let tenantDbUrl = config.test.tenantDbUrl;

const verifyFindUserOk = (expected, done) => {
  return (response) => {
    if (response.status === HttpStatus.OK && response.obj) {
      assert.assertFieldExists('username', response.obj, 'Expected user.username to exist');
      assert.assertFieldExists('password', response.obj, 'Expected user.password to exist');
      assert.assertFieldExists('firstname', response.obj, 'Expected user.firstname to exist');
      assert.assertFieldExists('lastname', response.obj, 'Expected user.lastname to exist');
      assert.assertFieldExists('phoneNumber', response.obj, 'Expected user.phoneNumber to exist');
      assert.assertFieldExists('email', response.obj, 'Expected user.email to exist');
      assert.assertFieldExists('accountId', response.obj, `Expected user.accountId to exist`);
      assert.assertFieldExists('tenantId', response.obj, `Expected user.tenantId to exist`);

      assert.assertEquals(response.obj.username, expected.username,
            `Expected ${response.obj.username} === ${expected.username}`);
      assert.assertEquals(response.obj.email, expected.email,
            `Expected ${response.obj.email} === ${expected.email}`);
      assert.assertEquals(response.obj.firstname, expected.firstname,
            `Expected ${response.obj.firstname} === ${expected.firstname}`);
      assert.assertEquals(response.obj.lastname, expected.lastname,
         `Expected ${response.obj.lastname} === ${expected.lastname}`);
      assert.assertEquals(response.obj.phoneNumber, expected.phoneNumber,
         `Expected ${response.obj.phoneNumber} === ${expected.phoneNumber}`);
      assert.assertEquals(response.obj.accountId, expected.accountId,
        `Expected ${response.obj.accountId} === ${expected.accountId}`);
      assert.assertEquals(response.obj.tenantId, expected.tenantId,
        `Expected ${response.obj.tenantId} === ${expected.tenantId}`);
      done();
    } else {
      done(new Error('Expected Status Ok'));
    }
  };
};

const verifyFindUserMissingError = (done) => {
  return (err) => {
    done(err);
  };
};

const verifyFindUserMissingResponse = (done) => {
  return (done) => {
    done(new Error('Expected missing response'));
  };
};

const verifyBadRequest = (done) => {
  return (err) => {
    if (err.status === HttpStatus.BAD_REQUEST) {
      done();
    } else {
      done(new Error('Expected 400 - Bad Request'));
    }
  };
};

const verifyNotFoundRequest = (done) => {
  return (err) => {
    if (err.status === HttpStatus.NOT_FOUND) {
      done();
    } else {
      done(new Error('Expected 404 - Not found'));
    }
  };
};

describe('find-user-test', () => {
  let tenantService = null;
  let serviceTestHelper = new ServiceTestHelper();

  let tenantDbUrl = config.test.tenantDbUrl;
  let clearTenantDB  = require('mocha-mongoose')(tenantDbUrl, { noClear: true });

  let userEntry = newUserEntry();

  before((done) => {
    let mongoHelper = new MongoHelper('users', tenantDbUrl);
    mongoHelper.saveObject(userEntry).then((savedUser) => {
      userEntry.id = savedUser._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
      tenantService = service;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 - OK on find user', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, id: userEntry.id };
      service.api.users.getUser(query, verifyFindUserOk(userEntry, done), verifyFindUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 - BAD REQUEST on find user with malformed id', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let query = { 'x-fast-pass': true, id: 'dfdfsdfdsf' };
      service.api.users.getUser(query, verifyFindUserMissingResponse(done), verifyBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 404 - NOT FOUND on find user with unknownid', (done) => {
      let unknownId = '593709f02ad06137df88fc03';
      serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
        let query = { 'x-fast-pass': true, id: unknownId };
        service.api.users.getUser(query, verifyFindUserMissingResponse(done), verifyNotFoundRequest(done));
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

