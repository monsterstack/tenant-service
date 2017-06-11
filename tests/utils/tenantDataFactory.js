'use strict';
const mongoose = require('mongoose');

const newTenantEntry = (clientId, clientSecret) => {
  return {
        status: 'Active',
        apiSecret: clientSecret,
        timestamp: Date.now(),
        name: 'Testerson',
        apiKey: clientId,
        services: ['DiscoveryService'],
      };
};

module.exports.newTenantEntry = newTenantEntry;
