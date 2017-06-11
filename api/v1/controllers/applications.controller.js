'use strict';
const debug = require('debug')('application-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;
const Application = tenantModel.Application;

const ApplicationService = require(appRoot + '/libs/services/applicationService');
const Validator = require(appRoot + '/api/v1/validators/application.validator.js');

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
    let validator = new Validator();

    let appName = application.name;

    // Sanitize New Application
    application = validator.sanitize(application, true);

    validator.validateNewApplication(req, application.locale).then((result) => {
      if (!result.isEmpty()) {
        new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request', result.array()).writeResponse(res);
      } else {
        applicationService.findApplicationByName(appName).then((result) => {
          if (result) {
            res.status(HttpStatus.CONFLICT, 'An application with that name already exists');
          } else {
            applicationService.saveApplication(application).then((result) => {
              res.status(HttpStatus.OK).send(result);
            }).catch((err) => {
              new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
            });
          }
        }).catch((err) => {
          new ServiceError(HttpStatus.OK, err.message).writeResponse(res);
        });
      }
    });

  };
};

const updateApplication = (app) => {
  return (req, res) => {
    let application = req.body;
    let applicationService = new ApplicationService();
    let validator = new Validator();
    let applicationName = application.name;

    application = validator.sanitize(application);

    validator.validateApplication(req, application.locale).then((result) => {
      if (!result.isEmpty()) {
        new ServiceError(HttpStatus.BAD_REQUEST, 'Bad Request').writeResponse(res);
      } else {
        applicationService.findApplicationById(application.id).then((result) => {
          if (result) {
            applicationService.updateApplication(application).then((result) => {
              res.status(HttpStatus.OK).send(result);
            }).catch((err) => {
              new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, err.message).writeResponse(res);
            });
          } else {
            new ServiceError(HttpStatus.NOT_FOUND, 'Application not found').writeResponse(res);
          }
        }).catch((err) => {
          new ServiceError(HttpStatus.OK, err.message).writeResponse(res);
        });
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

exports.saveApplication = saveApplication;
exports.updateApplication = updateApplication;
exports.getApplication = getApplication;
exports.findApplications = findApplications;
