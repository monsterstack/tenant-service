'use strict';
const controller = require('../controllers/applications.controller.js');

module.exports = (app) => {
  /**
   	* @swagger
   	* /apps:
   	*  post:
   	*    summary: Save Application
   	*    description: Save Application
   	*    operationId: saveApplication
   	*    tags:
   	*      - applications
   	*    produces:
   	*      - application/json
   	*    consumes:
   	*      - application/json
   	*    parameters:
   	*      - name: application
   	*        description: application
   	*        type: object
   	*        schema:
   	*          $ref: '#/definitions/Application'
   	*        in: body
   	*        required: true
   	*      - name: x-fast-pass
   	*        description: Bypass Auth
   	*        type: boolean
   	*        in: header
   	*        require: false
   	*    responses:
   	*      201:
   	*        description: Application
   	*        type: object
   	*        schema:
   	*          $ref: '#/definitions/Application'
   	*      400:
   	*        description: Bad request
   	*        type: object
   	*        schema:
   	*          $ref: '#/definitions/Error'
   	*/
  app.post('/api/v1/apps', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.saveApplication(app));

  /**
   	* @swagger
   	* /apps:
   	*  put:
   	*    summary: Update Application
   	*    description: Update Application
   	*    operationId: updateApplication
   	*    tags:
   	*      - applications
   	*    produces:
   	*      - application/json
   	*    consumes:
   	*      - application/json
   	*    parameters:
   	*      - name: application
   	*        description: application
   	*        type: object
   	*        schema:
   	*          $ref: '#/definitions/Application'
   	*        in: body
   	*        required: true
   	*      - name: x-fast-pass
   	*        description: Bypass Auth
   	*        type: boolean
   	*        in: header
   	*        require: false
   	*    responses:
   	*      200:
   	*        description: Application
   	*        type: object
   	*        schema:
   	*          $ref: '#/definitions/Application'
   	*      400:
   	*        description: Bad request
   	*        type: object
   	*        schema:
   	*          $ref: '#/definitions/Error'
   	*/
  app.put('/api/v1/apps', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.updateApplication(app));

  /**
   * @swagger
   * /apps/{id}:
   *  get:
   *    summary: Get Application By Id
   *    description: Get Application By Id
   *    operationId: getApplication
   *    tags:
   *      - applications
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: id
   *        description: Id of Application
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
   *        description: Application
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Application'
   *      404:
   *        description: Not found
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.get('/api/v1/apps/:id', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.getApplication(app));

  /**
   * @swagger
   * /apps/_apiKey/{apiKey}:
   *  get:
   *    summary: Get Application By Api Key
   *    description: Get Application By Api Key
   *    operationId: getApplicationByApiKey
   *    tags:
   *      - applications
   *    produces:
   *      - application/json
   *    consumes:
   *      - application/json
   *    parameters:
   *      - name: apiKey
   *        description: Api Key of Application
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
   *        description: Application
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Application'
   *      404:
   *        description: Error
   *        type: object
   *        schema:
   *          $ref: '#/definitions/Error'
   */
  app.get('/api/v1/apps/_apiKey/:apiKey', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.getApplicationByApiKey(app));

  /**
   * @swagger
   * /apps:
   *  get:
   *    summary: Get Applications
   *    description: Get Page of Application(s)
   *    operationId: getApplications
   *    tags:
   *      - applications
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
   *          $ref: '#/definitions/Application'
   */
  app.get('/api/v1/apps', app.realizationCheck.dependenciesAreRealized(),
          app.authCheck.fastPass(), app.authCheck.authCheck(), controller.findApplications(app));
};
