'use strict';
const model = require('tenant-model').model;

class TenantService {
  constructor() {

  }

  findTenantById(id) {
    return model.findTenant(id);
  }

  findTenants(search, pageDescriptor) {
    if(search) {
      return model.findTenants(search, pageDescriptor.page, pageDescriptor.size, 'asc');
    } else {
      return model.allTenants(pageDescriptor.page, pageDescriptor.size, 'asc');
    }
  }

  saveTenant(tenant) {
    return model.saveTenant(tenant);
  }
}

module.exports = TenantService;
