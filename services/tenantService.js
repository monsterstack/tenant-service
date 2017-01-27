'use strict';
const model = require('tenant-model').model;

class TenantService {
  constructor() {
  }

  findTenantById(id) {
    return model.findTenant(id);
  }

  findTenantByApiKey(apiKey) {
    return model.findTenantByApiKey(apiKey);
  }

  findTenantByName(name) {
    return model.findTenantByName(name);
  }

  findTenants(search, pageDescriptor) {
    return model.findTenants(search, pageDescriptor.page, pageDescriptor.size, 'asc');
  }

  saveTenant(tenant) {
    return model.saveTenant(tenant);
  }
}

module.exports = TenantService;
