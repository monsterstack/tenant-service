'use strict';
const config = require('config');
const ApiBinding = require('discovery-proxy').ApiBinding;
const uuid = require('node-uuid');
const HttpStatus = require('http-status');

const startTestService = require('discovery-test-tools').startTestService;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;
const bindToGenericService = require('./utils').bindToGenericService;

const TokenTestHelper = require('service-test-helpers').TokenTestHelper;
const ServiceTestHelper = require('service-test-helpers').ServiceTestHelper;
const assert = require('service-test-helpers').Assert;

const newTenantEntry = require('./utils').newTenantEntry;
const newSecurityDescriptor = require('./utils').newSecurityDescriptor;

const SECURITY_PORT = 12616;

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const verifySaveTenantCreated = (expected, done) => {
  return (response) => {
    if (response.obj && response.status == HttpStatus.CREATED) {
      assert.assertFieldExists('id', response.obj, 'Expected tenant.id exists');
      assert.assertFieldExists('name', response.obj, 'Expected tenant.name exists');
      assert.assertFieldExists('status', response.obj, 'Expected tenant.status exists');
      assert.assertFieldExists('apiKey', response.obj, 'Expected tenant.apiKey exists');
      assert.assertFieldExists('apiSecret', response.obj, 'Expected tenant.apiSecret exists');
      assert.assertFieldExists('services', response.obj, 'Expected tenant.services exists');

      assert.assertEquals(response.obj.name, expected.name, `Expected ${response.obj.name} === ${expected.name}`);

      // Make sure the secret has the Tenant Name
      let tokenTestHelper = new TokenTestHelper();
      let decoded = tokenTestHelper.decodeSecret(response.obj.apiKey, response.obj.apiSecret);
      assert.assertEquals(response.obj.name, decoded.name, `Expected ${response.obj.name} === ${decoded.tenantName}`);
      assert.assertEquals('Tenant', decoded.scope, `Expected Tenant === ${decoded.scope}`);
      done();
    } else {
      done(new Error('Expected Http Status 201'));
    }
  };
};

const verifySaveTenantErrorMissing = (done) => {
  return (err) => {
    done(err);
  };
};

describe('post-tenant', (done) => {
    let tenantService = null;
    let tenantUrl = config.test.tenantDbUrl;

    let securityDescriptor = newSecurityDescriptor(SECURITY_PORT);

    let clientId = uuid.v1();
    let clientSecret = jwt.sign(clientId, 'shhhhh!');

    let tenantEntry = newTenantEntry(clientId, clientSecret);
    let serviceTestHelper = new ServiceTestHelper();
    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

    before((done) => {
      serviceTestHelper.startTestService('TenantService', {}).then((server) => {
        tenantService = server;
        tenantService.getApp().dependencies = { types: ['SecurityService'] };
        sideLoadSecurityDescriptor(tenantService, securityDescriptor).then(() => {
          done();
        }).catch((err) => {
          done(err);
        });
      }).catch((err) => {
        done(err);
      });
    });

    it('Post Tenant with Success', (done) => {
        serviceTestHelper.bindToGenericService(tenantService.getApp().listeningPort).then((service) => {
            if (service) {
              let request = { 'x-fast-pass': true, tenant: tenantEntry };
              service.api.tenants.saveTenant(request, verifySaveTenantCreated(tenantEntry, done), verifySaveTenantErrorMissing(done));
            } else {
              done(new Error('Tenant Service Not Found'));
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
