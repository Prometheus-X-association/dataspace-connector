import { Router } from "express";
import { body } from "express-validator";
import {
    exportData,
    importData,
} from "../../../controllers/public/v1/data.public.controller";
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Data routes
 */

/**
 * @swagger
 * /data/export:
 *   post:
 *     summary: export data
 *     tags: [Data]
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
        body("signedConsent").optional(),
        body("resourceId").optional(),
        body("consumerEndpoint").optional(),
    ],
    exportData
);

/**
 * @swagger
 * /data/import:
 *   post:
 *     summary: import data
 *     tags: [Data]
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
 *             user:
 *               description: user
 *               type: string
 *             data:
 *               description: data
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    "/import",
    [body("signedConsent"), body("data"), body("user")],
    importData
);

export default r;
