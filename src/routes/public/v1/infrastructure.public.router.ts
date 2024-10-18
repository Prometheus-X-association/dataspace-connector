import { Router } from 'express';
import { body } from 'express-validator';
import { InfrastructureWebhook } from '../../../controllers/public/v1/infrastructure.public.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Infrastructure
 *   description: Infrastructure webhook
 */

/**
 * @swagger
 * /infrastructure:
 *   post:
 *     summary: Infrastructure webhook
 *     tags: [Infrastructure]
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
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/',
    [
        body('dataExchangeId').isString().notEmpty(),
        body('data').isObject().notEmpty()
    ],
    InfrastructureWebhook
);


export default r;
