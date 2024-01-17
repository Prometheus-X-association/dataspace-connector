import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
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
 * /private/consumer/exchange:
 *   post:
 *     summary: Trigger data exchange between two connector
 *     tags: [Consumer]
 *     security:
 *       - jwt: []
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
 *             contractId:
 *               description: Contract id
 *               type: string
 *             contractType:
 *               description: Contract
 *               type: string
 *       '200':
 *         description: Successful response
 */
r.post(
    '/exchange',
    [
        body('providerEndpoint').isString(),
        body('contractId').isString(),
        body('contractType').isString(),
    ],
    auth,
    consumerExchange
);

/**
 * @swagger
 * /private/consumer/import:
 *   post:
 *     summary: Endpoint to import data
 *     tags: [Consumer]
 *     security:
 *       - jwt: []
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
