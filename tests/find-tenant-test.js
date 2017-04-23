'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('assert');

const startTestService = require('discovery-test-tools').startTestService;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;
const uuid = require('node-uuid');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

describe('find-tenant', () => {
    let tenantService = null;
    let tenantUrl = 'mongodb://localhost:27017/cdspTenant';

    let clientId = uuid.v1();
    let clientSecret = jwt.sign(clientId, 'shhhhh!');

    let securityDescriptor = {
        docsPath: 'http://cloudfront.mydocs.com/tenant',
        endpoint: `http://localhost:${SECURITY_PORT}`,
        healthCheckRoute:  '/health',
        region:  'us-east-1',
        schemaRoute:  '/swagger.json',
        stage:  'dev',
        status:  'Online',
        timestamp: Date.now(),
        type:  'SecurityService',
        version:  'v1',
      };

    let tenantEntry = {
        status: 'Active',
        apiSecret: clientSecret,
        timestamp: Date.now(),
        name: 'Testerson',
        apiKey: clientId,
        services: [
          {
            name: 'DiscoveryService',
            _id: mongoose.Types.ObjectId('58a98bad624702214a6e2ba9'),
          },
        ],
      };

    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, { noClear: true });

    let addTenant = (tenant) => {
        let p = new Promise((resolve, reject) => {
            let url = tenantUrl;

            // get the connection
            let conn = mongoose.createConnection(url);
            conn.collection('tenants').insertMany([tenant], (err, result) => {
                console.log(result);
                tenantEntry._id = result.ops[0]._id;
                resolve(result.ops[0]);
              });
          });

        return p;
      };

    /**
     * Start Tenant Service
     */
    const startTenantService = () => {
        let p = new Promise((resolve, reject) => {
            startTestService('TenantService', {}, (err, server) => {
                resolve(server);
              });
          });
        return p;
      };

    /**
     * Prepare the Test Suite
     */
    before((done) => {
        addTenant(tenantEntry).then((tenant) => {
            return startTenantService();
          }).then((service) => {
            tenantService = service;
            setTimeout(() => {
                tenantService.getApp().dependencies = ['SecurityService'];
                console.log(tenantService.getApp().dependencies);

                sideLoadSecurityDescriptor(tenantService, securityDescriptor).then(() => {
                    console.log(tenantService.getApp().dependencies);
                    console.log(tenantService.getApp().proxy);
                    done();
                  }).catch((err) => {
                    done(err);
                  });
              }, 1800);
          }).catch((err) => {
            done(err);
          });
      });

    it('Find Tenant By Id should Succeed', (done) => {
        console.log(`Listening port is ${tenantService.getApp().listeningPort}`);
        let service = {
            endpoint: `http://localhost:${tenantService.getApp().listeningPort}`,
            schemaRoute: '/swagger.json',
            _id: uuid.v1(),
          };

        let apiBinding = new ApiBinding(service);

        apiBinding.bind().then((service) => {
            if (service) {
              service.api.tenants.getTenant({ 'x-fast-pass': true, id: tenantEntry._id }, (tenant) => {
                  if (tenant.obj) {
                    done();
                  }
                }, (err) => {
                  done(err);
                });
            } else {
              done(new Error('Tenant Service Not Found'));
            }
          });
      });

    it('Find Tenant By Id should Fail with 404', (done) => {
        console.log(`Listening port is ${tenantService.getApp().listeningPort}`);
        let service = {
            endpoint: `http://localhost:${tenantService.getApp().listeningPort}`,
            schemaRoute: '/swagger.json',
            _id: uuid.v1(),
          };

        let apiBinding = new ApiBinding(service);

        apiBinding.bind().then((service) => {
            if (service) {
              service.api.tenants.getTenant({ 'x-fast-pass': true, id: '58a98bad624702214a6e2ba7' }, (tenant) => {
                  done();
                }, (err) => {
                  if (err.status === 404) {
                    done();
                  } else {
                    done(new Error(`Expected http status 404, received ${tenant.status}`));
                  }
                });
            } else {
              done(new Error('Missing Tenant Service'));
            }
          });
      });

    it('Find Page of Tenants should Succeed', (done) => {
        console.log(`Listening port is ${tenantService.getApp().listeningPort}`);
        let service = {
            endpoint: `http://localhost:${tenantService.getApp().listeningPort}`,
            schemaRoute: '/swagger.json',
            _id: uuid.v1(),
          };

        let apiBinding = new ApiBinding(service);

        apiBinding.bind().then((service) => {
            if (service) {
              service.api.tenants.getTenants({ 'x-fast-pass': true }, (tenant) => {
                  if (tenant.status === 200) {
                    if (tenant.obj.page) {
                      done();
                    } else {
                      done(new Error(`Expecting body with page field`));
                    }
                  } else
                      done(new Error(`Expecting http status 200, received ${tenant.status}`));
                }, (err) => {
                  done(err);
                });
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
