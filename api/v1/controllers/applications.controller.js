'use strict';
const debug = require('debug')('application-controller');
const appRoot = require('app-root-path');

const HttpStatus = require('http-status');
const tenantModel = require('tenant-model').model;
const ServiceError = require('core-server').ServiceError;
const Application = tenantModel.Application;

const ApplicationService = require(appRoot + '/libs/services/applicationService');

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
    let appName = application.name;

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
    let id = req.params.id;

    applicationService.findApplicationById(id).then((result) => {
      if (result) {
        res.status(HttpStatus.OK).send(result);
      } else {
        new ServiceError(HttpStatus.NOT_FOUND, 'Application Not found').writeResponse(res);
      }
    });
  };
};

exports.saveApplication = saveApplication;
exports.getApplication = getApplication;
exports.findApplications = findApplications;
