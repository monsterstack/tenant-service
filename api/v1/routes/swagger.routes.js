'use strict';

const controller = require('../controllers/swagger.controller.js');

/** Public **/
module.exports = (app) => {
  app.get('/swagger.json', controller.getSwagger(app));
};
