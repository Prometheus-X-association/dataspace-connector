import { Router } from 'express';
import {
    error,
    success,
    getDataExchanges,
    updateDataExchange,
    getDataExchangeById,
    createDataExchange,
    updateDataExchangeDataProcessing,
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
 *         providerEndpoint:
 *           type: string
 *           description: provider data space connector endpoint.
 *         purposeId:
 *           type: string
 *           description: purpose of the exchange, the service offering who consume the data.
 *         resourceId:
 *           type: string
 *           description: resource of the exchange, the service offering where the data come from.
 *         status:
 *           type: string
 *           description: status of the exchange.
 *         createdAt:
 *           type: string
 *           description: timestamp.
 *         updatedAt:
 *           type: string
 *           description: timestamp.
 */

r.post('/', createDataExchange);

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

// /**
//  * @swagger
//  * /dataexchanges/{id}:
//  *   put:
//  *     summary: update data exchange
//  *     tags: [Data-Exchange]
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *        - name: id
//  *          description: data exchange id.
//  *          in: path
//  *          required: true
//  *          type: string
//  *     requestBody:
//  *      content:
//  *       application/json:
//  *         schema:
//  *           type: object
//  *           properties:
//  *             consumerEndpoint:
//  *               description: consumer endpoint where the data have been imported
//  *             payload:
//  *               description: payload
//  *               type: string
//  *     responses:
//  *       '200':
//  *         description: Successful response
//  */
r.put('/:id', updateDataExchange);

r.put('/:id/servicechains/:index', updateDataExchangeDataProcessing);

// /**
//  * @swagger
//  * /dataexchanges/{id}/error:
//  *   put:
//  *     summary: Get Data space Connector Self Description
//  *     tags: [Data-Exchange]
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *        - name: id
//  *          description: data exchange id.
//  *          in: path
//  *          required: true
//  *          type: string
//  *     requestBody:
//  *      content:
//  *       application/json:
//  *         schema:
//  *           type: object
//  *           properties:
//  *             origin:
//  *               description: origin of the update
//  *               type: string
//  *             payload:
//  *               description: information about the error
//  *               type: string
//  *     responses:
//  *       '200':
//  *         description: Successful response
//  */
r.put('/:id/error', error);

// /**
//  * @swagger
//  * /dataexchanges/{id}/success:
//  *   put:
//  *     summary: Get Data space Connector Self Description
//  *     tags: [Data-Exchange]
//  *     produces:
//  *       - application/json
//  *     requestBody:
//  *      content:
//  *       application/json:
//  *         schema:
//  *           type: object
//  *           properties:
//  *             origin:
//  *               description: origin of the update
//  *               type: string
//  *     responses:
//  *       '200':
//  *         description: Successful response
//  */
r.put('/:id/success', success);

export default r;
