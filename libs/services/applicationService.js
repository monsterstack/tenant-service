'use strict';
const model = require('tenant-model').model;

class ApplicationService {

  findApplicationById(id) {
    return model.findApplication(id);
  }

  findApplicationByApiKey(apiKey) {
    return model.findApplicationByApiKey(apiKey);
  }

  findApplicationByName(name) {
    return model.findApplicationByName(name);
  }

  findApplications(search, pageDescriptor) {
    return model.findApplications(search, pageDescriptor.page, pageDescriptor.size, 'asc');
  }

  allApplications(pageDescriptor) {
    return model.allApplications(pageDescriptor.page, pageDescriptor.size, 'asc');
  }

  saveApplication(application) {
    return model.saveApplication(application);
  }

  updateApplication(application) {
    return model.updateApplication(application);
  }
}

module.exports.ApplicationService = ApplicationService;
