'use strict';

const controller = require('../controllers/tenants.controller.js');

/** Public **/
module.exports = function(app) {
  app.get('/api/v1/tenants/:id', controller.getTenant(app));
  app.get('/api/v1/tenants', controller.findTenants(app));
  app.post('/api/v1/tenants', controller.saveTenant(app));
}
