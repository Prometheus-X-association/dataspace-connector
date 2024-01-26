import { Router } from 'express';
import { getSelfDescription } from '../../../controllers/public/v1/description.public.controller';
import { login } from '../../../controllers/public/v1/authentication.public.controller';
import { body } from 'express-validator';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication to access private routes
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to use private routes
 *     tags: [Authentication]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             secretKey:
 *               description: PTX secret Key
 *               type: string
 *             serviceKey:
 *               description: PTX service Key
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/login',
    [body('secretKey').isString(), body('serviceKey').isString()],
    login
);

export default r;
