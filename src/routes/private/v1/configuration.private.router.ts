import { Router } from 'express';
import {
    getConfiguration,
    reloadConfiguration,
    resetConfiguration,
    updateConfiguration,
    updateConsentConfiguration,
} from '../../../controllers/private/v1/configuration.private.controller';
import { body } from 'express-validator';
import { urlValidation } from '../../../utils/validation/urlValidation';
import { validate } from '../../middlewares/validator.middleware';
import { auth } from '../../middlewares/auth.middleware';
const r: Router = Router();

r.use(auth);

/**
 * @swagger
 * tags:
 *   name: Configuration
 *   description: Configuration routes
 */

/**
 * @swagger
 * /private/configuration/:
 *   get:
 *     summary: get the configuration
 *     tags: [Configuration]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/', getConfiguration);

/**
 * @swagger
 * /private/configuration:
 *   put:
 *     summary: update configuration
 *     tags: [Configuration]
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
 *             endpoint:
 *               description: endpoint of the data space connector
 *               type: string
 *             serviceKey:
 *               description: service key of the participant provided by the catalog
 *               type: string
 *             secretKey:
 *               description: secret key of the participant provided by the catalog
 *               type: string
 *             catalogUri:
 *               description: endpoint of the catalog
 *               type: string
 *             contractUri:
 *               description: endpoint of the contract manager
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put(
    '/',
    [
        body('endpoint').optional().isString().custom(urlValidation),
        body('serviceKey').optional().isString(),
        body('secretKey').optional().isString(),
        body('catalogUri').optional().isString().custom(urlValidation),
        body('contractUri').optional().isString().custom(urlValidation),
    ],
    validate,
    updateConfiguration
);

/**
 * @swagger
 * /private/configuration/consent:
 *   put:
 *     summary: update consent configuration
 *     tags: [Configuration]
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
 *             publicKey:
 *               description: Base64 RSA public key
 *               type: string
 *             uri:
 *               description: consent manager uri
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put(
    '/consent',
    [
        body('publicKey').optional().isString(),
        body('uri').optional().isString().custom(urlValidation),
    ],
    updateConsentConfiguration
);

/**
 * @swagger
 * /private/configuration:
 *   delete:
 *     summary: delete configuration
 *     tags: [Configuration]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.delete('/', resetConfiguration);

/**
 * @swagger
 * components:
 *   schemas:
 *     Configuration:
 *       type: object
 *       properties:
 *         appKey:
 *           type: string
 *           description: The appkey of the dataspace connector.
 *           example: e6bbb3d733dc083b9d19dae8ed1bb31673379838fef6b88faa309b628f8b6124f2f306978200a90711b72e9d07b3e1d1d211fd219b2ce3ab5269a45fab009038
 *         catalogUri:
 *           type: string
 *           description: The uri of the catalog.
 *           example: https://catalog.api.com/v1/
 *         contractUri:
 *           type: string
 *           description: The uri of the contract.
 *           example: https://contract.api.com/v1/
 *         consentUri:
 *           type: string
 *           description: The uri of the consent updated by the consent.
 *           example: https://consent.api.com/v1/
 *         endpoint:
 *           type: string
 *           description: endpoint of the dataspace connector.
 *           example: https://connector.com/
 *         secretKey:
 *           type: string
 *           description: your secretKey from the catalog.
 *           example: hmP5WG7vBFsj1fxNYWyzzO7zgczCB
 *         serviceKey:
 *           type: string
 *           description: your secretKey from the catalog.
 *           example: Gr31PY4J2SRCPdqS5eaGQPE
 */

/**
 * @swagger
 * /private/configuration/reload:
 *   post:
 *     summary: reload the configuration from config.json file
 *     tags: [Configuration]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/reload', reloadConfiguration);

export default r;
