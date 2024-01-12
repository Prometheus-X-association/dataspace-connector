import { Router } from "express";
import { body } from "express-validator";
import { providerExport } from "../../../controllers/public/v1/provider.public.controller";
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
 *             signedConsent:
 *               description: signed consent
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    "/export",
    [
        body("dataExchangeId").optional(),
        body("resourceId").optional(),
        body("consumerEndpoint").optional(),
    ],
    providerExport
);

export default r;
