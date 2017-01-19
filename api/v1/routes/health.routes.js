'use strict';

const controller = require('../controllers/health.controller.js');

/** Public **/
module.exports = function(app) {
  app.get('/health', controller.getHealth(app));
}
