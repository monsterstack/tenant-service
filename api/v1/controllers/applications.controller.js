'use strict';
const debug = require('debug')('application-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;
const Application = tenantModel.Application;

const ApplicationService = require(appRoot + '/libs/services/applicationService').ApplicationService;
const TenantService = require(appRoot + '/libs/services/tenantService').TenantService;
const AccountService = require(appRoot + '/libs/services/accountService').AccountService;

const Validator = require(appRoot + '/api/v1/validators/application.validator');

/**
 * Build Page Descriptor
 */
const buildPageDescriptor = (query) => {
  return {
    page: query.page || 0,
    size: query.size || 10,
  };
};

const saveApplication = (app) => {
  return (req, res) => {
    debugger;
    let application = req.body;
    let applicationService = new ApplicationService();
    let tenantService = new TenantService();
    let accountService = new AccountService();
    let validator = new Validator();

    let appName = application.name;

    // Sanitize New Application
    application = validator.sanitize(application, true);

    validator.validateNewApplication(req, application.locale).then((result) => {
      if (!result.isEmpty()) {
        new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return tenantService.findTenantById(application.tenantId);
      }
    }).then((tenant) => {
      if (tenant) {
        // Adorn the application with a tenantName.
        application.tenantName = tenant.name;
        return accountService.findAccountById(application.accountId);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found can`t associate with app');
      }
    }).then((account) => {
      if (account) {
        return applicationService.findApplicationByName(application.name);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Account not found, unable to associate with app');
      }
    }).then((found) => {
      if (found) {
        throw new ServiceError(HttpStatus.CONFLICT, 'An application with that name already exists');
      } else {
        return applicationService.saveApplication(application);
      }
    }).then((savedApplication) => {
      res.status(HttpStatus.OK).send(savedApplication);
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const updateApplication = (app) => {
  return (req, res) => {
    let application = req.body;
    let applicationService = new ApplicationService();
    let tenantService = new TenantService();
    let accountService = new AccountService();

    let validator = new Validator();
    let applicationName = application.name;

    application = validator.sanitize(application);

    validator.validateApplication(req, application.locale).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request');
      } else {
        return tenantService.findTenantById(application.tenantId);
      }
    }).then((tenant) => {
      if (tenant) {
        return accountService.findAccountById(application.accountId);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Tenant not found can`t associate with app');
      }
    }).then((account) => {
      if (account) {
        return applicationService.findApplicationByName(application.name);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Account not found, unable to associate with app');
      }
    }).then((found) => {
      if (found) {
        return applicationService.updateApplication(application);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Application not found');
      }
    }).then((updatedApplication) => {
      res.status(HttpStatus.OK).send(updatedApplication);
    }).catch((err) => {
      if (err instanceof ServiceError) {
        err.writeResponse(res);
      } else {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      }
    });
  };
};

const findApplications = (app) => {
  return (req, res) => {
    let url = require('url');
    let urlParts = url.parse(req.url, true);
    let query = urlParts.query;
    let search = query.search;
    let pageDescriptor = buildPageDescriptor(query);
    let applicationService = new ApplicationService();

    if (search) {
      applicationService.findApplications(search, pageDescriptor).then((page) => {
        res.status(HttpStatus.OK).send(page);
      }).catch((err) => {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      });
    } else {
      applicationService.allApplications(pageDescriptor).then((page) => {
        res.status(HttpStatus.OK).send(page);
      }).catch((err) => {
        new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
      });
    }
  };
};

const getApplication = (app) => {
  return (req, res) => {
    let application = req.body;
    let applicationService = new ApplicationService();
    let validator = new Validator();
    let id = req.params.id;

    validator.validateIdQuery(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request');
      } else {
        return applicationService.findApplicationById(id);
      }
    }).then((found) => {
      if (found) {
        res.status(HttpStatus.OK).send(found);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Application not found');
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

/**
 * Get Tenant By Api Key
 * @Todo: Response always contains {} when 404
 */
const getApplicationByApiKey = (app) => {
  return (req, res) => {
    let apiKey = req.params.apiKey;
    let applicationService = new ApplicationService();
    let validator = new Validator();

    // Try to find by apiKey
    validator.validateApiKeyQuery(req).then((result) => {
      if (!result.isEmpty()) {
        throw new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array());
      } else {
        return applicationService.findApplicationByApiKey(apiKey);
      }
    }).then((found) => {
      if (found) {
        res.status(HttpStatus.OK).send(found);
      } else {
        throw new ServiceError(HttpStatus.NOT_FOUND, 'Application not found');
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

exports.saveApplication = saveApplication;
exports.updateApplication = updateApplication;
exports.getApplication = getApplication;
exports.getApplicationByApiKey = getApplicationByApiKey;
exports.findApplications = findApplications;
