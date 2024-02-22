import { Router } from 'express';
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
 *               example: ay_HiowSg_mVU1rQeZEyB31Clq3HUchXmhXclfrJih5HVQk2ueZEgDMiswvIZZNOGcXhO7pNVriv9nopcadWwDgEGy9Bt7f4TAsO
 *             serviceKey:
 *               description: PTX service Key
 *               type: string
 *               example: 1tATiK7E3A1H3d_wIiUXOtLCKkWZZKA_p2X0gwkDmFxpfCF4I3IslrdmkPD_38aTTrAzIQULixUWcBIlBFyBcyU8sxDRUZMX_OTc
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
