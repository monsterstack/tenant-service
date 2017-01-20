'use strict';

const appRoot = require('app-root-path');
const HttpStatus = require('http-status');
const Error = require('core-server').Error;
const HealthService = require('core-server').HealthService;


const getHealth = (app) => {
  return (req, res) => {
    let healthService = new HealthService();
    healthService.getHealth().then((health) => {
      res.status(HttpStatus.OK).send(health);
    }).catch((err) => {
      new Error(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  }
}

/* Public */
exports.getHealth = getHealth;
