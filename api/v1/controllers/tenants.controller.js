'use strict';
const debug = require('debug')('tenant-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;
const Tenant = tenantModel.Tenant;

const TenantService = require(appRoot + '/libs/services/tenantService');
const Validator = require(appRoot + '/api/v1/validators/tenant.validator');

/**
 * Build Page Descriptor
 */
const buildPageDescriptor = (query) => {
  return {
    page: query.page || 0,
    size: query.size || 10,
  };
};

/**
 * Get Tenant By Api Key
 * @Todo: Response always contains {} when 404
 */
const getTenantByApiKey = (app) => {
  return (req, res) => {
    let apiKey = req.params.apiKey;
    let tenantService = new TenantService();
    let validator = new Validator();

    // Try to find by apiKey
    validator.validateApiKeyQuery(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantByApiKey(apiKey);
      }
    }).then((found) => {
      if (found) {
        res.status(HttpStatus.OK).send(found);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found');
      }
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const getTenant = (app) => {
  return (req, res) => {
    let id = req.params.id;

    let tenantService = new TenantService();
    let validator = new Validator();

    validator.validateIdQuery(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantById(id);
      }
    }).then((found) => {
      if (found) {
        res.status(HttpStatus.OK).send(found);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found');
      }
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const findTenants = (app) => {
  return (req, res) => {
    let url = require('url');
    let urlParts = url.parse(req.url, true);
    let query = urlParts.query;
    let search = query.search;
    let pageDescriptor = buildPageDescriptor(query);
    let tenantService = new TenantService();

    if (search) {
      tenantService.findTenants(search, pageDescriptor).then((page) => {
        res.status(HttpStatus.OK).send(page);
      }).catch((err) => {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      });
    } else {
      tenantService.allTenants(pageDescriptor).then((page) => {
        res.status(HttpStatus.OK).send(page);
      }).catch((err) => {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      });
    }
  };
};

const saveTenant = (app) => {
  return (req, res) => {
    let tenant = req.body;
    let tenantService = new TenantService();
    let validator = new Validator();

    tenant = validator.sanitize(tenant, true);
    let tenantName = tenant.name;

    validator.validateNewTenant(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantByName(tenantName);
      }
    }).then((found) => {
      if (found) {
        throw new ServiceError(HttpStatus.CONFLICT, `Tenant already exists with that name ${tenantName}`);
      } else {
        return tenantService.saveTenant(tenant);
      }
    }).then((saved) => {
      res.status(HttpStatus.CREATED).send(saved);
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const updateTenant = (app) => {
  return (req, res) => {
    let tenant = req.body;
    let tenantService = new TenantService();
    let validator = new Validator();
    let tenantName = tenant.name;

    validator.validateTenant(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantById(tenant.id);
      }
    }).then((found) => {
      if (found) {
        found = tenantModel.merge(found, tenant, ['status', 'services']);
        return tenantService.updateTenant(found);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found');
      }
    }).then((updatedTenant) => {
      res.status(HttpStatus.OK).send(updatedTenant);
    }).catch((err) => {
      if (err instanceof ServiceError)
        err.writeResponse(res);
      else
        new ServiceError(HttpStatus.OK, err.message).writeResponse(res);
    });
  };
};

/* Public */
exports.getTenant = getTenant;
exports.getTenantByApiKey = getTenantByApiKey;
exports.saveTenant = saveTenant;
exports.updateTenant = updateTenant;
exports.findTenants = findTenants;
