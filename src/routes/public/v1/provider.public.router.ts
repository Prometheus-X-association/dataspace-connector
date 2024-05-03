import { Router } from 'express';
import { body } from 'express-validator';
import {
    providerExport,
    providerImport,
} from '../../../controllers/public/v1/provider.public.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Provider
 *   description: Provider webhook
 */

/**
 * @swagger
 * /provider/export:
 *   post:
 *     summary: Provider exchange webhook
 *     tags: [Provider]
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
 *             consumerEndpoint:
 *               description: Consumer self-description
 *               type: string
 *             contract:
 *               description: contract self-description
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/export',
    [
        body('dataExchange').isObject(),
        body('consumerEndpoint').isString(),
        body('contract').isString(),
    ],
    providerExport
);

/**
 * @swagger
 * /provider/import:
 *   post:
 *     summary: Provider import webhook
 *     tags: [Provider]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               description: data to import
 *               type: string
 *             dataExchange:
 *               description: dataExchange
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/import',
    [body('dataExchange').isObject(), body('data').isObject()],
    providerImport
);

export default r;
