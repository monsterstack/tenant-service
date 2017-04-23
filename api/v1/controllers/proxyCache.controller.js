'use strict';
const appRoot = require('app-root-path');
const HttpStatus = require('http-status');
const ServiceError = require('core-server').ServiceError;
const ProxyCacheService = require('core-server').ProxyCacheService;

const cache = (app) => {
  return (req, res) => {
    let proxyCacheService = new ProxyCacheService(app.proxy);
    proxyCacheService.cache().then((cache) => {
      res.status(HttpStatus.OK).send(cache);
    }).catch((error) => {
      new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  };
};

/* Public */
exports.cache = cache;
