'use strict';

/**
 * @swagger
 * definitions:
 *   ServiceName:
 *     type: object
 *     required:
 *       - name
 *     properties:
 *        name:
 *          type: string
 *   Tenant:
 *     type: object
 *     required:
 *       - name
 *       - timestamp
 *       - status
 *       - apiKey
 *       - apiSecret
 *     properties:
 *        id:
 *          type: string
 *        name:
 *          type: string
 *        status:
 *          type: string
 *        apiKey:
 *          type: string
 *        apiSecret:
 *          type: string
 *        services:
 *          type: array
 *          items:
 *            schema:
 *              $ref: #/definitions/ServiceName
 *        timestamp:
 *          type: number
 *          format: date
 */
