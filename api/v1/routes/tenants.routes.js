'use strict';

const controller = require('../controllers/tenants.controller.js');

/** Public **/
module.exports = function(app) {
  console.log('Reading the route');
  app.get('/api/v1/tenants/:id', controller.getTenant(app));
}
