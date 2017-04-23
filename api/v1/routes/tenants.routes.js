'use strict';

const controller = require('../controllers/tenants.controller.js');

/** Public **/
module.exports = function (app) {
  /**
   * @swagger
   * /tenants/{id}:
   *  get:
   *    summary: Get Tenant By Id
   *    description: Get Tenant By Id
   *    operationId: getTenant
   *    tags:
   *      - tenants
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Id of Tenant
   *        type: string
   *        in: path
   *        required: true
   *      - name: x-fast-pass
   *        description: Bypass Auth
   *        type: boolean
   *        in: header
   *        require: false
   *    responses:
   *      200:
   *        description: Tenant
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Tenant'
   *      404:
   *        description: Not found
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.get('/api/v1/tenants/:id', app.realizationCheck.dependenciesAreRealized(),
            app.authCheck.fastPass(), app.authCheck.authCheck(), controller.getTenant(app));

  /**
   * @swagger
   * /tenants/_apiKey/{apiKey}:
   *  get:
   *    summary: Get Tenant By Api Key
   *    description: Get Tenant By Api Key
   *    operationId: getTenantByApiKey
   *    tags:
   *      - tenants
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: apiKey
   *        description: Api Key of Tenant
   *        type: string
   *        in: path
   *        required: true
   *      - name: x-fast-pass
   *        description: Bypass Auth
   *        type: boolean
   *        in: header
   *        require: false
   *    responses:
   *      200:
   *        description: Tenant
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Tenant'
   *      404:
   *        description: Error
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.get('/api/v1/tenants/_apiKey/:apiKey', app.realizationCheck.dependenciesAreRealized(),
        app.authCheck.fastPass(), app.authCheck.authCheck(), controller.getTenantByApiKey(app));

  /**
   * @swagger
   * /tenants:
   *  get:
   *    summary: Get Tenants
   *    description: Get Page of Tenant(s)
   *    operationId: getTenants
   *    tags:
   *      - tenants
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: search
   *        description: Text Search String
   *        type: string
   *        in: query
   *        required: false
   *      - name: page
   *        description: Page Number ( 0 index based )
   *        type: integer
   *        format: int64
   *        required: false
   *      - name: size
   *        description: Page Size - default 10
   *        type: integer
   *        format: int64
   *        required: false
   *      - name: x-fast-pass
   *        description: Bypass Auth
   *        type: boolean
   *        in: header
   *        require: false
   *    responses:
   *      200:
   *        description: PageResponse
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Tenant'
   */
  app.get('/api/v1/tenants', app.realizationCheck.dependenciesAreRealized(),
      app.authCheck.fastPass(), app.authCheck.authCheck(), controller.findTenants(app));

  /**
   * @swagger
   * /tenants:
   *  post:
   *    summary: Save Tenant
   *    description: Save Tenant
   *    operationId: saveTenant
   *    tags:
   *      - tenants
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: tenant
   *        description: tenant
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Tenant'
   *        in: body
   *        required: true
   *      - name: x-fast-pass
   *        description: Bypass Auth
   *        type: boolean
   *        in: header
   *        require: false
   *    responses:
   *      200:
   *        description: Tenant
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Tenant'
   *      400:
   *        description: Bad request
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.post('/api/v1/tenants', app.realizationCheck.dependenciesAreRealized(),
        app.authCheck.fastPass(), app.authCheck.authCheck(), controller.saveTenant(app));
};
