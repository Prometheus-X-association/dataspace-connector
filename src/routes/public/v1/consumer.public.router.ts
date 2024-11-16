import { Router } from 'express';
import { body } from 'express-validator';
import {
    consumerExchange,
    consumerImport,
} from '../../../controllers/public/v1/consumer.public.controller';
import { auth } from '../../middlewares/auth.middleware';
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
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *        application/json:
 *         schema:
 *           type: object
 *           properties:
 *             contract:
 *               description: Contract self-description
 *               type: string
 *               required: true
 *               example: https://contract.com/contracts/id
 *             purposeId:
 *               description: consumer service offering URI
 *               type: string
 *               required: false
 *               example: https://catalog.api.com/v1/catalog/serviceofferings/id
 *             resourceId:
 *               description: provider service offering URI
 *               type: string
 *               required: false
 *               example: https://catalog.api.com/v1/catalog/serviceofferings/id
 *             dataProcessingId:
 *               description: id of the selected data processing chains in the contract
 *               type: string
 *               required: false
 *               example: 670e8eb6b439a2379f290fc6
 *             resources:
 *               description: array of provider data resource URI
 *               type: array
 *               required: false
 *               example: [{
 *                   "resource": "https://catalog.api.com/v1/catalog/dataresources/id",
 *                   "params": {
 *                       "query": [
 *                           {"page":0},
 *                           {"limit":10}
 *                       ]
 *                   }
 *               }]
 *             providerParams:
 *               description: object of query params
 *               type: object
 *               required: false
 *               example: {
 *                   "query": [
 *                           {"page":0},
 *                           {"limit":10}
 *                       ]
 *               }
 *       '200':
 *         description: Successful response
 */
r.post(
    '/exchange',
    auth,
    [
        body('contract').isString(),
        body('purposeId').isString().optional(),
        body('resourceId').isString().optional(),
        body('resources').isArray().optional(),
        body('providerParams').isArray().optional(),
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
