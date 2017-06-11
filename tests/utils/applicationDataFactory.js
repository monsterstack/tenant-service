'use strict';

const newApplicationEntry = (clientId, clientSecret) => {
  return {
    locale: 'en-US',
    name: 'MyApplication',
    status: 'Live',
    apiKey: clientId,
    apiSecret: clientSecret,
    accountId: '593709f02ad06137df88fc09',
    tenantId: '593709f02ad06137df88fc09',
    scope: ['all'],
  };
};

module.exports.newApplicationEntry = newApplicationEntry;
