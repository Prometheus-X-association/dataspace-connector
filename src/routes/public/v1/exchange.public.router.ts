import { Router } from 'express';
import { body } from 'express-validator';
import { consumerExchange } from '../../../controllers/public/v1/consumer.public.controller';
import { auth } from '../../middlewares/auth.middleware';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Exchange
 *   description: Exchange trigger endpoint
 */

/**
 * @swagger
 * /exchange:
 *   post:
 *     summary: Trigger data exchange between two connector
 *     tags: [Exchange]
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
    '/',
    auth,
    [
        body('contract').isString(),
        body('purposeId').isString().optional(),
        body('resourceId').isString().optional(),
        body('resources').isArray().optional(),
        body('providerParams').isArray().optional(),
        body('dataProcessingId').isString().optional(),
    ],
    consumerExchange
);

export default r;
