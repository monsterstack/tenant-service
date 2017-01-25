'use strict';

const controller = require('../controllers/tenants.controller.js');

/** Public **/
module.exports = function(app) {
  /**
   * @swagger
   * /tenants/:id
   *  get:
   *    description: Get Tenant By Id
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Id of Tenant
   *        type: string
   *        in: path
   *        required: true
   *    responses:
   *      200:
   *        description: Tenant
   *        type: object
   *        schema:
   *          $ref: #/definitions/Tenant
   */
  app.get('/api/v1/tenants/:id', controller.getTenant(app));

  /**
   * @swagger
   * /tenants
   *  get:
   *    description: Get Page of Tenant(s)
   *    produces:
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
   *    responses:
   *      200:
   *        description: PageResponse
   *        type: object
   *        schema:
   *          $ref: #/definitions/PageResponse
   */
  app.get('/api/v1/tenants', controller.findTenants(app));

  /**
   * @swagger
   * /tenants
   *  post:
   *    description: Save Tenant
   *    produces:
   *      - application/json
   *    parameters:
   *      - name: tenant
   *        description: Text Search String
   *        type: object
   *        schema:
   *          $ref: #/definitions/Tenant
   *        in: body
   *        required: true
   *    responses:
   *      200:
   *        description: Tenant
   *        type: object
   *        schema:
   *          $ref: #/definitions/Tenant
   */
  app.post('/api/v1/tenants', controller.saveTenant(app));
}
