import { Router } from 'express';
import { body } from 'express-validator';
import {
    exportConsent,
    importConsent,
} from '../../../controllers/public/v1/consent.public.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consent
 *   description: Consent routes
 */

/**
 * @swagger
 * /consent/export:
 *   post:
 *     summary: export consent
 *     tags: [Consent]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             signedConsent:
 *               description: signed consent
 *               type: string
 *             encrypted:
 *               description: encrypted key
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/export', [body('signedConsent'), body('encrypted')], exportConsent);

/**
 * @swagger
 * /consent/import:
 *   post:
 *     summary: import consent
 *     tags: [Consent]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             signedConsent:
 *               description: signed consent
 *               type: string
 *             serviceExportUrl:
 *               description: export url
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/import',
    [body('signedConsent'), body('serviceExportUrl')],
    importConsent
);

export default r;
