'use strict';
const controller = require('../controllers/users.controller.js');

module.exports = (app) => {
  /**
    * @swagger
    * /users:
    *  post:
    *    summary: Save User
    *    description: Save User
    *    operationId: saveUser
    *    tags:
    *      - users
    *    produces:
    *      - application/json
    *    consumes:
    *      - application/json
    *    parameters:
    *      - name: user
    *        description: user
    *        type: object
    *        schema:
    *          $ref: '#/definitions/User'
    *        in: body
    *        required: true
    *      - name: x-fast-pass
    *        description: Bypass Auth
    *        type: boolean
    *        in: header
    *        require: false
    *    responses:
    *      201:
    *        description: User
    *        type: object
    *        schema:
    *          $ref: '#/definitions/User'
    *      400:
    *        description: Bad request
    *        type: object
    *        schema:
    *          $ref: '#/definitions/Error'
    */
  app.post('/api/v1/users', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.saveUser(app));

  /**
    * @swagger
    * /users:
    *  put:
    *    summary: Update User
    *    description: Update User
    *    operationId: updateUser
    *    tags:
    *      - users
    *    produces:
    *      - application/json
    *    consumes:
    *      - application/json
    *    parameters:
    *      - name: user
    *        description: user
    *        type: object
    *        schema:
    *          $ref: '#/definitions/User'
    *        in: body
    *        required: true
    *      - name: x-fast-pass
    *        description: Bypass Auth
    *        type: boolean
    *        in: header
    *        require: false
    *    responses:
    *      200:
    *        description: User
    *        type: object
    *        schema:
    *          $ref: '#/definitions/User'
    *      400:
    *        description: Bad request
    *        type: object
    *        schema:
    *          $ref: '#/definitions/Error'
    */
  app.put('/api/v1/users', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.updateUser(app));

  /**
   * @swagger
   * /users/{id}:
   *  get:
   *    summary: Get User By Id
   *    description: Get User By Id
   *    operationId: getUser
   *    tags:
   *      - users
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Id of User
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
   *        description: User
   *        type: object
   *        schema:
   *          $ref: '#/definitions/User'
   *      404:
   *        description: Not found
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.get('/api/v1/users/:id', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.getUser(app));
};
