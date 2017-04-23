'use strict';

const controller = require('../controllers/proxyCache.controller.js');

/** Public **/
module.exports = (app) => {
  app.get('/proxyCache', controller.cache(app));
};
