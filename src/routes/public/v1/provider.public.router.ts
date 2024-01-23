import { Router } from 'express';
import { body } from 'express-validator';
import { providerExport } from '../../../controllers/public/v1/provider.public.controller';
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

export default r;
