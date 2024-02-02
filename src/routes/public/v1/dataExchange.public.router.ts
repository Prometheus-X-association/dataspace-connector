import { Router } from 'express';
import {
    error,
    success,
    getDataExchanges,
    updateDataExchange,
    getDataExchangeById,
} from '../../../controllers/public/v1/dataExchange.public.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Data-Exchange
 *   description: Data Exchange webhooks and routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Dataexchange:
 *       type: object
 *       properties:
 *         contract:
 *           type: string
 *           description: the self-description of the contract on which the exchange is based.
 *           example: https://contract.api.com/contracts/65ae67ec930f0049cf8e7144
 *         providerEndpoint:
 *           type: string
 *           description: provider data space connector endpoint.
 *           example: http://provider.connector.com/
 *         purposeId:
 *           type: string
 *           description: purpose of the exchange, the service offering who consume the data.
 *           example: http://catalog.api.com/v1/catalog/serviceoffering/65afd2042791f143d1dd66d6
 *         resourceId:
 *           type: string
 *           description: resource of the exchange, the service offering where the data come from.
 *           example: http://catalog.api.com/v1/catalog/serviceoffering/65ae6d45e955ab17198da374
 *         status:
 *           type: string
 *           description: status of the exchange.
 *           example: PENDING
 *         createdAt:
 *           type: string
 *           description: timestamp.
 *           example: 2024-01-23T15:46:01.378Z
 *         updatedAt:
 *           type: string
 *           description: timestamp.
 *           example: 2024-01-23T15:46:01.378Z
 */

/**
 * @swagger
 * /dataexchanges/:
 *   get:
 *     summary: Get all data exchange
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/', getDataExchanges);

/**
 * @swagger
 * /dataexchanges/{id}:
 *   get:
 *     summary: Get data exchange by id
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: data exchange id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:id', getDataExchangeById);

/**
 * @swagger
 * /dataexchanges/{id}:
 *   put:
 *     summary: update data exchange
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: data exchange id.
 *          in: path
 *          required: true
 *          type: string
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             consumerEndpoint:
 *               description: consumer endpoint where the data have been imported
 *             payload:
 *               description: payload
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put('/:id', updateDataExchange);

/**
 * @swagger
 * /dataexchanges/{id}/error:
 *   put:
 *     summary: Get Data space Connector Self Description
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: data exchange id.
 *          in: path
 *          required: true
 *          type: string
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             origin:
 *               description: origin of the update
 *               type: string
 *             payload:
 *               description: information about the error
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put('/:id/error', error);

/**
 * @swagger
 * /dataexchanges/{id}/success:
 *   put:
 *     summary: Get Data space Connector Self Description
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             origin:
 *               description: origin of the update
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put('/:id/success', success);

export default r;
