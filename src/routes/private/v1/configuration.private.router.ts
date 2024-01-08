import { Router } from "express";
import {
    getSelfDescription
} from "../../../controllers/public/v1/description.public.controller";
import {updateConfiguration} from "../../../controllers/private/v1/configuration.private.controller";
import {auth} from "../../middlewares/auth.middleware";
import {body, check} from "express-validator";
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
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put("/", [
    body('endpoint').optional().isString(),
], auth, updateConfiguration);

export default r;
