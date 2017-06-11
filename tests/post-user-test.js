'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;

const newUserEntry = require('./utils').newUserEntry;
const newUserEntryMissingUsername = require('./utils').newUserEntryMissingUsername;
const newUserEntryMissingPassword = require('./utils').newUserEntryMissingPassword;
const newUserEntryMissingFirstname = require('./utils').newUserEntryMissingFirstname;
const newUserEntryMissingLastname = require('./utils').newUserEntryMissingLastname;
const newUserEntryMissingEmail = require('./utils').newUserEntryMissingEmail;
const newUserEntryMissingPhone = require('./utils').newUserEntryMissingPhone;

const assert = require('service-test-helpers').Assert;

const verifiySaveUserOk = (expected, done) => {
  return (response) => {
    if (response.status === HttpStatus.CREATED && response.obj) {
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
      done(new Error('Expected 201 on save'));
    }
  };
};

const verifySaveUserMissingResponse = (done) => {
  return (response) => {
    done(new Error('Expecting no sucessful response'));
  };
};

const verifySaveUserBadRequest = (done) => {
  return (err) => {
    if (err.status === HttpStatus.BAD_REQUEST) {
      done();
    } else {
      done(new Error('Expected Bad Request Response'));
    }
  };

};

const verifySaveUserMissingError = (done) => {
  return (err) => {
    done(err);
  };
};

describe('post-user-test', () => {
  let tenantService;
  let serviceTestHelper = new ServiceTestHelper();
  let userEntry = newUserEntry();
  let userEntryMissingUsername = newUserEntryMissingUsername();
  let userEntryMissingPassword = newUserEntryMissingPassword();
  let userEntryMissingFirstname = newUserEntryMissingFirstname();
  let userEntryMissingLastname = newUserEntryMissingLastname();
  let userEntryMissingEmail = newUserEntryMissingEmail();
  let userEntryMissingPhone = newUserEntryMissingPhone();

  let tenantUrl = config.test.tenantDbUrl;
  let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

  before((done) => {
    serviceTestHelper.startTestService('TenantService', {}).then((service) => {
      tenantService = service;
      done();
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 201 on user post', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntry };
      service.api.users.saveUser(request, verifiySaveUserOk(userEntry, done), verifySaveUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user post with missing username', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingUsername };
      service.api.users.saveUser(request, verifySaveUserMissingResponse(done), verifySaveUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user post with missing password', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingPassword };
      service.api.users.saveUser(request, verifySaveUserMissingResponse(done), verifySaveUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user post with missing firstname', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingFirstname };
      service.api.users.saveUser(request, verifySaveUserMissingResponse(done), verifySaveUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user post with missing lastname', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingLastname };
      service.api.users.saveUser(request, verifySaveUserMissingResponse(done), verifySaveUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user post with missing email', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingEmail };
      service.api.users.saveUser(request, verifySaveUserMissingResponse(done), verifySaveUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user post with missing phone', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingPhone };
      service.api.users.saveUser(request, verifySaveUserMissingResponse(done), verifySaveUserBadRequest(done));
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
