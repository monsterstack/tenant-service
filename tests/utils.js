'use strict';
const mongoose = require('mongoose');
const uuid = require('node-uuid');
const Promise = require('promise');

const userData = require('./utils/userDataFactory');
const accountData = require('./utils/accountDataFactory');
const applicationData = require('./utils/applicationDataFactory');
const tenantData = require('./utils/tenantDataFactory');

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

const changeField = (id, obj, fieldName, newValue) => {
  obj.id = id;
  obj[fieldName] = newValue;
  return obj;
};

module.exports.MongoHelper = MongoHelper;
module.exports.newTenantEntry = tenantData.newTenantEntry;

module.exports.changeField = changeField;

// -- User Data Stuff
module.exports.newUserEntry = userData.newUserEntry;
module.exports.newUserEntryMissingUsername = userData.newUserEntryMissingUsername;
module.exports.newUserEntryMissingPassword = userData.newUserEntryMissingPassword;
module.exports.newUserEntryMissingFirstname = userData.newUserEntryMissingFirstname;
module.exports.newUserEntryMissingLastname = userData.newUserEntryMissingLastname;
module.exports.newUserEntryMissingEmail = userData.newUserEntryMissingEmail;
module.exports.newUserEntryMissingPhone = userData.newUserEntryMissingPhone;
module.exports.newUserEntryMissingAccountId = userData.newUserEntryMissingAccountId;
module.exports.newUserEntryMissingTenantId = userData.newUserEntryMissingTenantId;
module.exports.newUserEntryInvalidEmail = userData.newUserEntryInvalidEmail;
module.exports.newUserEntryInvalidPhone = userData.newUserEntryInvalidPhone;
module.exports.newUserEntryInvalidFirstname = userData.newUserEntryInvalidFirstname;
module.exports.newUserEntryInvalidLastname = userData.newUserEntryInvalidLastname;
module.exports.changeUserField = userData.changeUserField;

// -- Account Data Stuff
module.exports.newAccountEntry = accountData.newAccountEntry;

// -- Application Data Stuff
module.exports.newApplicationEntry = applicationData.newApplicationEntry;

// -- Misc Stuff
module.exports.newSecurityDescriptor = newSecurityDescriptor;
module.exports.newMinimalGenericServiceDescriptor = newMinimalGenericServiceDescriptor;

module.exports.bindToGenericService = bindToGenericService;
