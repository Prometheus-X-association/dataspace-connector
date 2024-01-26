import { Router } from 'express';
import { getSelfDescription } from '../../../controllers/public/v1/description.public.controller';
import { updateConfiguration } from '../../../controllers/private/v1/configuration.private.controller';
import { auth } from '../../middlewares/auth.middleware';
import { body, check } from 'express-validator';
import {
    createCredential,
    getCredentialById,
    getCredentials,
    updateCredential,
} from '../../../controllers/private/v1/credentials.private.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Credentials
 *   description: Credentials routes
 */

/**
 * @swagger
 * /private/credentials/{id}:
 *   put:
 *     summary: update credentials
 *     tags: [Credentials]
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
 *             type:
 *               description: basic or api-header
 *               type: string
 *             key:
 *               description: username or key
 *               type: string
 *             value:
 *               description: password or key value
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put(
    '/:id',
    [
        check('id').isString(),
        body('type').optional().isString(),
        body('key').optional().isString(),
        body('value').optional().isString(),
    ],
    auth,
    updateCredential
);

/**
 * @swagger
 * /private/credentials:
 *   get:
 *     summary: get credentials
 *     tags: [Credentials]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/', auth, getCredentials);

/**
 * @swagger
 * /private/credentials/{id}:
 *   get:
 *     summary: get credential by id
 *     tags: [Credentials]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:id', [check('id').isString()], auth, getCredentialById);

/**
 * @swagger
 * /private/credentials:
 *   post:
 *     summary: create credentials
 *     tags: [Credentials]
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
 *             type:
 *               description: basic or api-header
 *               type: string
 *             key:
 *               description: username or key
 *               type: string
 *             value:
 *               description: password or key value
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/',
    [body('type').isString(), body('key').isString(), body('value').isString()],
    auth,
    createCredential
);

export default r;
