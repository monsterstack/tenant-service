'use strict';

/**
 * @swagger
 * tags:
 *  - name: error
 *    description: 'Everything you need to know about Error'
 *  - name: health
 *    description: 'Everything you need to know about Health'
 *  - name: serviceNames
 *    description: 'Everything you need to know about ServiceNames'
 *  - name: pageDescriptors
 *    description: 'Everything you need to know about PageDescriptors'
 *  - name: pageResponses
 *    description: 'Everything you need to know about PageResponses'
 *  - name: tenants
 *    description: 'Everything you need to know about Tenants'
 *  - name: applications
 * 	  description: 'Everything you need to know about Applications'
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
 *        - loadAvg
 *     properties:
 *        cpuPercentUsage:
 *          type: number
 *        loadAvg:
 *          type: number
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
 *          $ref: '#/definitions/PageDescriptor'
 *       elements:
 *          type: array
 *          items:
 *            $ref: '#/definitions/Tenant'
 * 	 Application:
 * 		 type: object
 * 		 required:
 * 			 - name
 * 			 - apiKey
 * 			 - apiSecret
 * 			 - tenantId
 * 			 - scope
 * 		 properties:
 * 			 id:
 * 				 type: string
 * 			 name:
 * 				 type: string
 * 			 apiKey:
 * 				 type: string
 * 			 apiSecret:
 * 				 type: string
 * 			 scope:
 * 				 type: array
 * 				 items:
 * 					 type: string
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
 *            $ref: '#/definitions/ServiceName'
 *        timestamp:
 *          type: number
 *          format: date
 */
