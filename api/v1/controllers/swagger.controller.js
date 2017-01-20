'use strict';
const appRoot = require('app-root-path');
const HttpStatus = require('http-status');
const Error = require('core-server').Error;
const SwaggerService = require('core-server').SwaggerService;
const ip = require('ip');
const swagger = require(appRoot + '/api/swagger/swagger.json');

const getSwagger = (app) => {
  return (req, res) => {
    let swaggerService = new SwaggerService('/api/v1');
    swaggerService.getSwagger().then((swagger) => {
      res.status(HttpStatus.OK).send(swagger);
    }).catch((err) => {
      new Error(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  }
}

/* Public */
exports.getSwagger = getSwagger;
