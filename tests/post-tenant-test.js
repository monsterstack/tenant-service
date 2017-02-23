'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('assert');

const startTestService = require('discovery-test-tools').startTestService;
const sideLoadSecurityDescriptor = require('discovery-test-tools').sideLoadServiceDescriptor;

const SECURITY_PORT = 12616;

const mongoose = require('mongoose');

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
}


describe('post-tenant', (done) => {
    let tenantService = null;
    let tenantUrl = 'mongodb://localhost:27017/cdspTenant';

    let securityDescriptor = {
        "docsPath": 'http://cloudfront.mydocs.com/tenant', 
        "endpoint": `http://localhost:${SECURITY_PORT}`,
        "healthCheckRoute":  "/health" ,
        "region":  "us-east-1" ,
        "schemaRoute":  "/swagger.json" ,
        "stage":  "dev" ,
        "status":  "Online" ,
        "timestamp": Date.now(),
        "type":  "SecurityService" ,
        "version":  "v1"
    };

    let tenantEntry = {
        "status" : "Active",
        "timestamp" : Date.now(),
	    "name" : "Testerson",
	    "services" : [{
			"name" : "DiscoveryService",
			"_id" : mongoose.Types.ObjectId("58a98bad624702214a6e2ba9")
		}]
    };

    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, {noClear: true})

    before((done) => {
        startTenantService().then((server) => {
            tenantService = server;
            setTimeout(() => {
                tenantService.getApp().dependencies = { types: ['SecurityService'] };
                console.log(tenantService.getApp().dependencies);

                sideLoadSecurityDescriptor(tenantService, securityDescriptor).then(() => {
                    console.log(tenantService.getApp().dependencies);
                    console.log(tenantService.getApp().proxy);
                    done();
                }).catch((err) => {
                    done(err);
                });
            }, 1500);
        }).catch((err) => {
            done(err);
        });
    });

    it('Post Tenant with Success', (done) => {
        let service = {
            endpoint: `http://localhost:${tenantService.getApp().listeningPort}`,
            schemaRoute: '/swagger.json'
        };

        let apiBinding = new ApiBinding(service);
        

        apiBinding.bind().then((service) => {
            if(service) {
                service.api.tenants.saveTenant({'x-fast-pass': true, tenant: tenantEntry}, (tenant) => {
                    if(tenant.obj) {
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


    after((done) => {
        clearTenantDB((err) => {
            if(err) done(err);
            else done();
        })
    });
})