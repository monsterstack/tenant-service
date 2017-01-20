'use strict';

const controller = require('../controllers/health.controller.js');

module.exports = (app) => {
  /**
   * @swagger
   * /health:
   *  get:
   *    description: Get Health of Service
   *    produces:
   *      - application/json
   *    responses:
   *      200:
   *        description: Health
   */
    app.get('/health', controller.getHealth(app));
}
