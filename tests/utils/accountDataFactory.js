'use strict';
const uuid = require('node-uuid');

const newAccountEntry = () => {
  return {
    accountNumber: uuid.v1(),
    tenantId: '593709f02ad06137df88fc09',
  };
};

module.exports.newAccountEntry = newAccountEntry;
