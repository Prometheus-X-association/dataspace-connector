import { Router } from "express";
import { getSelfDescription } from "../../../controllers/public/v1/description.public.controller";
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Self-Description
 *   description: Self Description of a data space connector
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get Data space Connector Self Description
 *     tags: [Self-Description]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get("/", getSelfDescription);

export default r;
