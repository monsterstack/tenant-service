'use strict';
const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const Error = require('../../error.js');
const Tenant = tenantModel.Tenant;
/**
 * Build Page Descriptor
 */
const buildPageDescriptor = (query) => {
  return {
    page: query.page || 0,
    size: query.size || 10
  }
}

const getTenant = (app) => {
  return (req, res) => {
    let id = req.params.id;
     tenantModel.findTenant(id).then((result) => {
       console.log(result);
       res.status(HttpStatus.OK).send(result);
     }).catch((err) => {
       assert(err === null, "Failure did not occur");
       done();
    });


  }
}

const saveTenant = (app) => {
  return (req, res) => {
    var tenant = new Tenant(req.body);
    console.log(tenant);
     tenantModel.saveTenant(tenant).then((result) => {
       console.log(result);
       res.status(HttpStatus.OK).send(result);
     }).catch((err) => {
       assert(err === null, "Failure did not occur");
       done();
    });
  }
}

/* Public */
exports.getTenant = getTenant;
exports.saveTenant = saveTenant;
