import { Router } from 'express';
import { body } from 'express-validator';
import {
    consumerExchange,
    consumerImport,
} from '../../../controllers/private/v1/consumer.private.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consumer
 *   description: Consumer webhooks
 */

/**
 * @swagger
 * /consumer/exchange:
 *   post:
 *     summary: Trigger data exchange between two connector
 *     tags: [Consumer]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             providerEndpoint:
 *               description: Endpoint url of the connector who need to exchange data
 *               type: string
 *             contract:
 *               description: Contract self-description
 *               type: string
 *       '200':
 *         description: Successful response
 */
r.post(
    '/exchange',
    [
        body('providerEndpoint').isString(),
        body('contract').isString(),
        body('purposeId').isString().optional(),
        body('resourceId').isString().optional(),
    ],
    consumerExchange
);

/**
 * @swagger
 * /consumer/import:
 *   post:
 *     summary: Endpoint to import data
 *     tags: [Consumer]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             dataExchangeId:
 *               description: data exchange id
 *               type: string
 *             data:
 *               description: data
 *               type: string
 *       '200':
 *         description: Successful response
 */
r.post(
    '/import',
    [body('dataExchangeId').isString(), body('data').isString()],
    consumerImport
);

export default r;
