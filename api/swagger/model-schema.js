'use strict';

/**
 * @swagger
 * definitions:
 *   Error:
 *     type: object
 *     required:
 *        - errorMessage
 *     properties:
 *        errorMessage:
 *          type: string
 *   Health:
 *     type: object
 *     required:
 *        - cpuPercentUsage
 *        - totalMemPercentageUsage
 *        - loadAvg
 *   ServiceName:
 *     type: object
 *     required:
 *       - name
 *     properties:
 *        name:
 *          type: string
 *   PageDescriptor:
 *     type: object
 *     required:
 *       - page
 *       - size
 *       - total
 *     properties:
 *        page:
 *          type: integer
 *          format: int64
 *        size:
 *          type: integer
 *          format: int64
 *        total:
 *          type: integer
 *          format: int64
 *   PageResponse:
 *     type: object
 *     required:
 *       - page
 *       - elements
 *     properties:
 *       page:
 *          type: object
 *          schema:
 *            $ref: '#/definitions/PageDescriptor'
 *       elements:
 *          type: array
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
