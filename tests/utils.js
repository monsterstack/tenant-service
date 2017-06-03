'use strict';
const mongoose = require('mongoose');
const uuid = require('node-uuid');
const Promise = require('promise');

const ApiBinding = require('discovery-proxy').ApiBinding;

class MongoHelper {
  constructor(collection, dbUrl) {
    this.dbUrl = dbUrl;
    this.collection = collection;
  }

  saveObject(object) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      // get the connection
      let conn = mongoose.createConnection(_this.dbUrl);
      conn.collection(_this.collection).insertMany([object], (err, result) => {
        if (err)
         reject(err);
        else
         resolve(result.ops[0]);
      });
    });

    return p;
  }
}

const newTenantEntry = (clientId, clientSecret) => {
  return {
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
};

const newApplicationEntry = () => {
  return {
    name: 'MyApplication',
    status: 'Live',
    apiKey: '',
    apiSecret: '',
    tenantId: '11111',
    accountId: '2232323',
    scope: ['all'],
  };
};

const newAccountEntry = () => {
  return {
    accountNumber: uuid.v1(),
    tenantId: '1111',
  };
};

const newSecurityDescriptor = (securityPort) => {
  return {
        docsPath: 'http://cloudfront.mydocs.com/tenant',
        endpoint: `http://localhost:${securityPort}`,
        healthCheckRoute:  '/health',
        region:  'us-east-1',
        schemaRoute:  '/swagger.json',
        stage:  'dev',
        status:  'Online',
        timestamp: Date.now(),
        type:  'SecurityService',
        version:  'v1',
      };
};

const newMinimalGenericServiceDescriptor = (listeningPort) => {
  return {
            endpoint: `http://localhost:${listeningPort}`,
            schemaRoute: '/swagger.json',
            _id: uuid.v1(),
          };
};

const bindToGenericService = (listeningPort) => {
  let service = newMinimalGenericServiceDescriptor(listeningPort);
  let apiBinding = new ApiBinding(service);
  return apiBinding.bind();
};

module.exports.MongoHelper = MongoHelper;
module.exports.newTenantEntry = newTenantEntry;
module.exports.newAccountEntry = newAccountEntry;
module.exports.newApplicationEntry = newApplicationEntry;
module.exports.newSecurityDescriptor = newSecurityDescriptor;
module.exports.newMinimalGenericServiceDescriptor = newMinimalGenericServiceDescriptor;

module.exports.bindToGenericService = bindToGenericService;
