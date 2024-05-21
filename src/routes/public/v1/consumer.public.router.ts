import { Router } from 'express';
import { body } from 'express-validator';
import {
    consumerExchange,
    consumerImport,
} from '../../../controllers/public/v1/consumer.public.controller';
import {auth} from "../../middlewares/auth.middleware";
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
 *             providerEndpoint:
 *               description: Endpoint url of the connector of the provider
 *               type: string
 *               required: true
 *               example: https://provider.connector.com/
 *             contract:
 *               description: Contract self-description
 *               type: string
 *               required: true
 *               example: https://contract.com/contracts/id
 *             purposeId:
 *               description: consumer service offering self-description
 *               type: string
 *               required: false
 *               example: https://catalog.api.com/v1/catalog/serviceofferings/id
 *             resourceId:
 *               description: provider service offering self-description
 *               type: string
 *               required: false
 *               example: https://catalog.api.com/v1/catalog/serviceofferings/id
 *       '200':
 *         description: Successful response
 */
r.post(
    '/exchange',
    auth,
    [
        body('providerEndpoint').isString().optional(),
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
