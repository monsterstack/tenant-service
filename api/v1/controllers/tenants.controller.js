'use strict';
const debug = require('debug')('tenant-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const Error = require('core-server').Error;
const Tenant = tenantModel.Tenant;

const TenantService = require(appRoot + '/services/tenantService');

/**
 * Build Page Descriptor
 */
const buildPageDescriptor = (query) => {
  return {
    page: query.page || 0,
    size: query.size || 10
  }
}

/**
 * Get Tenant By Api Key
 * @Todo: Response always contains {} when 404
 */
const getTenantByApiKey = (app) => {
  return (req, res) => {
    let apiKey = req.params.apiKey;
    let tenantService = new TenantService();
    // Try to find by apiKey
    tenantService.findTenantByApiKey(apiKey).then((result) => {
      console.log(result);
      if(result) {
        res.status(HttpStatus.OK).send(result);
      } else {
        let errorResponse = new Error(HttpStatus.NOT_FOUND, "Tenant not found");
        console.log(errorResponse.toJSON());
        errorResponse.writeResponse(res);
      }
    }).catch((err) => {
      if(err instanceof Error) {
        err.writeResponse(res);
      } else {
        new Error(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  }
}

const getTenant = (app) => {
  return (req, res) => {
    let id = req.params.id;
    // validate id requirements.  If invalid return BAD_REQUEST
    let tenantService = new TenantService();
    tenantService.findTenantById(id).then((result) => {
       if(result) {
         res.status(HttpStatus.OK).send(result);
       } else {
         new Error(HttpStatus.NOT_FOUND, "Not found").writeResponse(res);
       }
     }).catch((err) => {
       let errResponse = new Error(HttpStatus.INTERNAL_SERVER_ERROR, err.message);
       console.log(errResponse.toJSON());
       errResponse.writeResponse(res);
    });
  }
}

const findTenants = (app) => {
  return (req, res) => {
    let url = require('url');
    let url_parts = url.parse(req.url, true);
    let query = url_parts.query;
    let search = query.search;
    let pageDescriptor = buildPageDescriptor(query);
    let tenantService = new TenantService();

    tenantService.findTenants(search, pageDescriptor).then((page) => {
      res.status(HttpStatus.OK).send(page);
    }).catch((err) => {
      new Error(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
    });
  }
}

const saveTenant = (app) => {
  return (req, res) => {
    let tenant = req.body;
    console.log(tenant);
    console.log(tenant.name);
    let tenantService = new TenantService();
    let tenantName = tenant.name;
    
    tenantService.findTenantByName(tenantName).then((result) => {
        if (result ){
          res.status(HttpStatus.BAD_REQUEST, "A tenant with that name already exists");
        } else{
          tenantService.saveTenant(tenant).then((result) => {
             console.log(result);
             res.status(HttpStatus.OK).send(result);
           }).catch((err) => {
              new Error(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
          });
        }
    }).catch((err) => {
      new Error(HttpStatus.OK, err.message).writeResponse(res);
  }
 }
}

/* Public */
exports.getTenant = getTenant;
exports.getTenantByApiKey = getTenantByApiKey;
exports.saveTenant = saveTenant;
exports.findTenants = findTenants;
