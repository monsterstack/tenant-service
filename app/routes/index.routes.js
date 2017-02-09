'use strict';
const appRoot = require('app-root-path');
const controller = require(appRoot + '/app/controllers/index.controller');

module.exports = (app) => {
  app.get('/', controller.getIndex(app));
}
