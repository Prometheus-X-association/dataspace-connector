import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { body, check } from 'express-validator';
import {
    createCredential,
    getCredentialById,
    getCredentials,
    updateCredential,
} from '../../../controllers/private/v1/credentials.private.controller';
const r: Router = Router();

r.use(auth);

/**
 * @swagger
 * tags:
 *   name: Credentials
 *   description: Credentials routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Credential:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: the Key in the header.
 *         value:
 *           type: string
 *           description: the value of the key.
 *         type:
 *           type: string
 *           description: type of the credential, only apiKey supported.
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
 *     parameters:
 *        - name: id
 *          description: credential id.
 *          in: path
 *          required: true
 *          type: string
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             type:
 *               description: apiKey
 *               type: string
 *               example: apiKey
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
r.get('/', getCredentials);

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
 *     parameters:
 *        - name: id
 *          description: credential id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:id', [check('id').isString()], getCredentialById);

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
 *               description: apiKey
 *               type: string
 *               example: apiKey
 *             key:
 *               description: username or key
 *               type: string
 *             value:
 *               description: password or key value
 *               type: string
 *             content:
 *               description: content of credential for s3
 *               type: object
 *               properties:
 *                  accessKeyId:
 *                      type: string
 *                      description: access key id for s3
 *                  secretAccessKey:
 *                      type: string
 *                      description: secret access key for s3
 *                  region:
 *                      type: string
 *                      description: region for s3
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/',
    [
        body('type').exists().isString().contains([
            'basic',
            'apiKey',
            'proxy',
            's3'
        ]),
        body('key').optional().isString(),
        body('value').optional().isString(),
        body('value').optional().isObject(),
    ],
    createCredential
);

export default r;
