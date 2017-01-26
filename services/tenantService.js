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

<<<<<<< HEAD
  findTenantByName(name) {
    return model.findTenantByName(name);
  }

  findTenants(search, page, size, sort) {
    return model.findTenants(search, page, size, sort);
=======
  findTenants(search, pageDescriptor) {
    return model.findTenants(search, pageDescriptor.page, pageDescriptor.size, 'asc');
>>>>>>> 8a02807a26da2683fe62f046064cf1cc948f0278
  }

  saveTenant(tenant) {
    return model.saveTenant(tenant);
  }
}

module.exports = TenantService;
