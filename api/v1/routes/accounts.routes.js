'use strict';
const controller = require('../controllers/accounts.controller.js');

module.exports = (app) => {
  /**
    * @swagger
    * /accounts:
    *  post:
    *    summary: Save Account
    *    description: Save Account
    *    operationId: saveAccount
    *    tags:
    *      - accounts
    *    produces:
    *      - application/json
    *    consumes:
    *      - application/json
    *    parameters:
    *      - name: account
    *        description: account
    *        type: object
    *        schema:
    *          $ref: '#/definitions/Account'
    *        in: body
    *        required: true
    *      - name: x-fast-pass
    *        description: Bypass Auth
    *        type: boolean
    *        in: header
    *        require: false
    *    responses:
    *      201:
    *        description: Account
    *        type: object
    *        schema:
    *          $ref: '#/definitions/Account'
    *      400:
    *        description: Bad request
    *        type: object
    *        schema:
    *          $ref: '#/definitions/Error'
    */
  app.post('/api/v1/accounts', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.saveAccount(app));

  /**
   * @swagger
   * /accounts/{id}:
   *  get:
   *    summary: Get Account By Id
   *    description: Get Account By Id
   *    operationId: getAccount
   *    tags:
   *      - accounts
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Id of Account
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
   *        description: Account
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Account'
   *      404:
   *        description: Not found
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.get('/api/v1/accounts/:id', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.getAccount(app));
};
