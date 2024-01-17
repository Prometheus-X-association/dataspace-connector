import { Router } from 'express';
import {
        updateConfiguration,
        updateConsentConfiguration
} from "../../../controllers/private/v1/configuration.private.controller";
import { body } from 'express-validator';
import { urlValidation } from '../../../utils/validation/urlValidation';
import { validate } from '../../middlewares/validator.middleware';
import { keyValidation } from '../../../utils/validation/keyValidation';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Configuration
 *   description: Configuration routes
 */

/**
 * @swagger
 * /private/configuration:
 *   put:
 *     summary: update configuration
 *     tags: [Configuration]
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
 *             consentUri:
 *               description: endpoint of the consent
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put(
    '/',
    [
        body('endpoint').optional().isString().custom(urlValidation),
        body('serviceKey').optional().isString().custom(keyValidation),
        body('secretKey').optional().isString().custom(keyValidation),
        body('catalogUri').optional().isString().custom(urlValidation),
        body('consentUri').optional().isString().custom(urlValidation),
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

export default r;
