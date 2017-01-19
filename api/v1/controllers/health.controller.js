'use strict';
const appRoot = require('app-root-path');
const HttpStatus = require('http-status');

const getHealth = (app) => {
  return function(req, res) {
    res.status(HttpStatus.OK).send({});
  }
}

/* Public */
exports.getHealth = getHealth;
