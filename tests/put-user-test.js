'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const md5 = require('md5');

const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;
const MongoHelper = require('./utils').MongoHelper;

const newUserEntry = require('./utils').newUserEntry;
const newUserEntryMissingUsername = require('./utils').newUserEntryMissingUsername;
const newUserEntryMissingFirstname = require('./utils').newUserEntryMissingFirstname;
const newUserEntryMissingLastname = require('./utils').newUserEntryMissingLastname;
const newUserEntryMissingPhoneNumber = require('./utils').newUserEntryMissingPhone;
const newUserEntryMissingEmail = require('./utils').newUserEntryMissingEmail;
const newUserEntryMissingAccountId = require('./utils').newUserEntryMissingAccountId;
const newUserEntryMissingTenantId = require('./utils').newUserEntryMissingTenantId;
const newUserEntryInvalidEmail = require('./utils').newUserEntryInvalidEmail;
const newUserEntryInvalidPhoneNumber = require('./utils').newUserEntryInvalidPhone;
const newUserEntryInvalidFirstname = require('./utils').newUserEntryInvalidFirstname;
const newUserEntryInvalidLastname = require('./utils').newUserEntryInvalidLastname;
const changeUserField = require('./utils').changeUserField;

const newTenantEntry = require('./utils').newTenantEntry;
const newAccountEntry = require('./utils').newAccountEntry;

const verifyUpdateUserOk = (expected, done) => {
  return (response) => {
    if (response.status === HttpStatus.OK && response.obj) {
      assert.assertFieldExists('id', response.obj, 'Expected user.id exists');
      assert.assertFieldExists('username', response.obj, 'Expected user.username to exist');
      assert.assertFieldExists('password', response.obj, 'Expected user.password to exist');
      assert.assertFieldExists('firstname', response.obj, 'Expected user.firstname to exist');
      assert.assertFieldExists('lastname', response.obj, 'Expected user.lastname to exist');
      assert.assertFieldExists('phoneNumber', response.obj, 'Expected user.phoneNumber to exist');
      assert.assertFieldExists('email', response.obj, 'Expected user.email to exist');
      assert.assertFieldExists('accountId', response.obj, `Expected user.accountId to exist`);
      assert.assertFieldExists('tenantId', response.obj, `Expected user.tenantId to exist`);

      assert.assertEquals(response.obj.username, expected.username,
              `Expected username ${response.obj.username} === ${expected.username}`);
      assert.assertEquals(response.obj.email, expected.email,
            `Expected email ${response.obj.email} === ${expected.email}`);
      assert.assertEquals(response.obj.firstname, expected.firstname,
            `Expected firstName ${response.obj.firstname} === ${expected.firstname}`);
      assert.assertEquals(response.obj.lastname, expected.lastname,
         `Expected lastName ${response.obj.lastname} === ${expected.lastname}`);
      assert.assertEquals(response.obj.phoneNumber, expected.phoneNumber,
         `Expected phoneNumber ${response.obj.phoneNumber} === ${expected.phoneNumber}`);
      assert.assertEquals(response.obj.accountId, expected.accountId,
        `Expected accountId ${response.obj.accountId} === ${expected.accountId}`);
      assert.assertEquals(response.obj.tenantId, expected.tenantId,
        `Expected tenantId ${response.obj.tenantId} === ${expected.tenantId}`);

      done();
    } else {
      done(new Error('Expected response status 200'));
    }
  };
};

const verifyUpdateUserMissingError = (done) => {
  return (error) => {
    done(error);
  };
};

const verifyUpdateUserMissingResponse = (done) => {
  return (response) => {
    done(new Error('Expected missing response'));
  };
};

const verifyUpdateUserBadRequest = (done) => {
  return (err) => {
    if (err.status === HttpStatus.BAD_REQUEST) {
      done();
    } else {
      done(new Error('Expected Bad Request 400'));
    }
  };
};

describe('put-user-test', () => {
  let tenantService = null;
  let tenantDbUrl = config.test.tenantDbUrl;
  let userMongoHelper = new MongoHelper('users', tenantDbUrl);
  let tenantMongoHelper = new MongoHelper('tenants', tenantDbUrl);
  let accountMongoHelper = new MongoHelper('accounts', tenantDbUrl);

  let serviceTestHelper = new ServiceTestHelper();

  let clearTenantDB  = require('mocha-mongoose')(tenantDbUrl, { noClear: true });

  let userEntry = newUserEntry();
  let userEntryMissingUsername = newUserEntryMissingUsername();
  let userEntryMissingFirstname = newUserEntryMissingFirstname();
  let userEntryMissingLastname = newUserEntryMissingLastname();
  let userEntryMissingPhoneNumber = newUserEntryMissingPhoneNumber();
  let userEntryMissingEmail = newUserEntryMissingEmail();
  let userEntryMissingAccountId = newUserEntryMissingAccountId();
  let userEntryMissingTenantId = newUserEntryMissingTenantId();
  let userEntryInvalidEmail = newUserEntryInvalidEmail();
  let userEntryInvalidPhone = newUserEntryInvalidPhoneNumber();
  let userEntryInvalidFirstname = newUserEntryInvalidFirstname();
  let userEntryInvalidLastname = newUserEntryInvalidLastname();

  let tenantEntry = newTenantEntry();
  let accountEntry = newAccountEntry();

  before((done) => {
    userEntry.password = md5(userEntry.password);
    tenantMongoHelper.saveObject(tenantEntry).then((savedTenant) => {
      userEntry.tenantId = savedTenant._id.toString();
      return accountMongoHelper.saveObject(accountEntry);
    }).then((savedAccount) => {
      userEntry.accountId = savedAccount._id.toString();
      return userMongoHelper.saveObject(userEntry);
    }).then((savedUser) => {
      userEntry.id = savedUser._id;
      return serviceTestHelper.startTestService('TenantService', {});
    }).then((service) => {
        tenantService = service;
        done();
      }).catch((err) => {
        done(err);
      });
  });

  it('shall return 200 on user update-email', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'email', 'myemail@email.com');
    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();

    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on user update-phoneNumber', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'phoneNumber', '+19876543212');
    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();

    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on user update-password', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'password', md5('foobar'));
    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();

    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on user update-role', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'role', 'Admin');
    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();

    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on user update-firstname', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'firstname', 'Jose');
    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();

    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on user update-lastname', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'role', 'Aguire');
    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();

    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 200 on user update-username', (done) => {
    let userEntryToUpdate = changeUserField(userEntry.id, newUserEntry(), 'username', 'Axeman');

    userEntryToUpdate.tenantId = tenantEntry._id.toString();
    userEntryToUpdate.accountId = accountEntry._id.toString();
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryToUpdate };
      service.api.users.updateUser(request, verifyUpdateUserOk(userEntryToUpdate, done), verifyUpdateUserMissingError(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing username', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingUsername };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing firstname', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingFirstname };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing lastname', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingLastname };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing phoneNumber', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingPhoneNumber };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing email', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingEmail };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with invalid email', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryInvalidEmail };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with invalid firstname', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryInvalidFirstname };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with invalid lastname', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryInvalidLastname };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing accountId', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingAccountId };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
    }).catch((err) => {
      done(err);
    });
  });

  it('shall return 400 on user put with missing tenantId', (done) => {
    serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
      let request = { 'x-fast-pass': true, user: userEntryMissingTenantId };
      service.api.users.updateUser(request, verifyUpdateUserMissingResponse(done), verifyUpdateUserBadRequest(done));
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

