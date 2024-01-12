import { Router } from "express";
import {
    error,
    success,
    getDataExchange,
    getDataExchanges,
    updateDataExchange,
} from "../../../controllers/public/v1/dataExchange.public.controller";
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Data-Exchange
 *   description: Data Exchange webhooks and routes
 */

/**
 * @swagger
 * /dataexchanges/:
 *   get:
 *     summary: Get all data exchange
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get("/", getDataExchanges);

/**
 * @swagger
 * /dataexchanges/{id}:
 *   get:
 *     summary: Get data exchange by id
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get("/:id", getDataExchange);

/**
 * @swagger
 * /dataexchanges/{id}:
 *   get:
 *     summary: update data exchange
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             consumerEndpoint:
 *               description: consumer endpoint where the data have been imported
 *             payload:
 *               description: payload
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put("/:id", updateDataExchange);

/**
 * @swagger
 * /dataexchanges/{id}/error:
 *   get:
 *     summary: Get Data space Connector Self Description
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             origin:
 *               description: origin of the update
 *               type: string
 *             payload:
 *               description: information about the error
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put("/:id/error", error);

/**
 * @swagger
 * /dataexchanges/{id}/success:
 *   get:
 *     summary: Get Data space Connector Self Description
 *     tags: [Data-Exchange]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             origin:
 *               description: origin of the update
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put("/:id/success", success);

export default r;
