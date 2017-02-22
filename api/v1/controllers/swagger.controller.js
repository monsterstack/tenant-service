'use strict';
const appRoot = require('app-root-path');
const HttpStatus = require('http-status');
const ServiceError = require('core-server').ServiceError;
const SwaggerService = require('core-server').SwaggerService;
const ip = require('ip');
const swagger = require(appRoot + '/api/swagger/swagger.json');

const getSwagger = (app) => {
  return (req, res) => {
    let swaggerService = new SwaggerService('/api/v1');
    swaggerService.getSwagger().then((swagger) => {
      if(swagger === null) {
        new ServiceError(HttpStatus.NOT_FOUND, 'Swagger Not Found').writeResponse(res);
      } else {
        res.status(HttpStatus.OK).send(swagger);
      }
    }).catch((err) => {
      new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  }
}

/* Public */
exports.getSwagger = getSwagger;