import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { body, check } from 'express-validator';
import { uploadFile } from '../../../controllers/private/v1/file.private.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Files upload routes
 */

/**
 * @swagger
 * /private/files:
 *   post:
 *     summary: upload a file on the connector
 *     tags: [Files]
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
 *             file:
 *               description: base64 of the file
 *               type: string
 *             checksum:
 *               description: checksum of the file
 *               type: string
 *             fileName:
 *               description: file name
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/',
    [
        body('file').isString(),
        body('checksum').isString(),
        body('fileName').isString(),
    ],
    auth,
    uploadFile
);

export default r;
