'use strict';
const md5 = require('md5');

const changeUserField = (id, obj, fieldName, newValue) => {
  obj.id = id;
  obj.password = md5(obj.password);
  obj[fieldName] = newValue;
  return obj;
};

const newUserEntry = () => {
  return {
    firstname: 'Bobby',
    locale: 'en-US',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19546789878',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryInvalidEmail = () => {
  return {
    firstname: 'Bobby',
    locale: 'en-US',
    lastname: 'Villa',
    email: 'bob.villa0micro.com',
    phoneNumber: '+19546789878',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryInvalidPhone = () => {
  return {
    firstname: 'Bobby',
    locale: 'en-US',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    phoneNumber: 'P19546789878',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryInvalidFirstname = () => {
  return {
    firstname: '',
    locale: 'en-US',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    phoneNumber: 'P19546789878',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryInvalidLastname = () => {
  return {
    firstname: 'Bobby',
    locale: 'en-US',
    lastname: '',
    email: 'bob.villa@micro.com',
    phoneNumber: 'P19546789878',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingPhone = () => {
  return {
    firstname: 'Bobby',
    locale: 'en-US',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingEmail = () => {
  return {
    locale: 'en-US',
    firstname: 'Bobby',
    lastname: 'Villa',
    phoneNumber: '+19544830245',
    username: 'bobbyvilla',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingPassword = () => {
  return {
    locale: 'en-US',
    firstname: 'Bobby',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19544830245',
    username: 'bobbyvilla',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingUsername = () => {
  return {
    locale: 'en-US',
    firstname: 'Bobby',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19544830245',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingFirstname = () => {
  return {
    locale: 'en-US',
    username: 'bobbyv',
    lastname: 'Villa',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19544830245',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingLastname = () => {
  return {
    locale: 'en-US',
    username: 'bobbyv',
    firstname: 'Bobby',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19544830245',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingAccountId = () => {
  return {
    locale: 'en-US',
    username: 'bobbyv',
    firstname: 'Bobby',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19544830245',
    password: 'dfadfewr',
    tenantId: '593709f02ad06137df88fc09',
  };
};

const newUserEntryMissingTenantId = () => {
  return {
    locale: 'en-US',
    username: 'bobbyv',
    firstname: 'Bobby',
    email: 'bob.villa@micro.com',
    phoneNumber: '+19544830245',
    password: 'dfadfewr',
    accountId: '593709f02ad06137df88fc09',
  };
};

module.exports.changeUserField = changeUserField;
module.exports.newUserEntry = newUserEntry;
module.exports.newUserEntryMissingUsername = newUserEntryMissingUsername;
module.exports.newUserEntryMissingPassword = newUserEntryMissingPassword;
module.exports.newUserEntryMissingFirstname = newUserEntryMissingFirstname;
module.exports.newUserEntryMissingLastname = newUserEntryMissingLastname;
module.exports.newUserEntryMissingEmail = newUserEntryMissingEmail;
module.exports.newUserEntryMissingPhone = newUserEntryMissingPhone;
module.exports.newUserEntryMissingAccountId = newUserEntryMissingAccountId;
module.exports.newUserEntryMissingTenantId = newUserEntryMissingTenantId;
module.exports.newUserEntryInvalidEmail = newUserEntryInvalidEmail;
module.exports.newUserEntryInvalidPhone = newUserEntryInvalidPhone;
module.exports.newUserEntryInvalidFirstname = newUserEntryInvalidFirstname;
module.exports.newUserEntryInvalidLastname = newUserEntryInvalidLastname;

