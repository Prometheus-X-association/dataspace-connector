import { Router } from 'express';
import {
    login,
    refresh,
    regenerate,
} from '../../../controllers/public/v1/authentication.public.controller';
import { body } from 'express-validator';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication to access private routes
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to use private routes
 *     tags: [Authentication]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             secretKey:
 *               description: PTX secret Key
 *               type: string
 *             serviceKey:
 *               description: PTX service Key
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                  type: string
 *                  description: timestamp of the response
 *                  example: 1709025673657
 *                 code:
 *                  type: integer
 *                  description: http code of the response
 *                  example: 200
 *                 content:
 *                  type: object
 *                  properties:
 *                   token:
 *                     type: string
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsImlhdCI6MTcwOTAyNTY3MzY1NCwiZXhwIjoxNzA5MDI1NjczOTU0fQ.WI2KCtxOvnoffBgB5QSYL5ClDLblKORAcYb5SQR-Nqw
 *                   refreshToken:
 *                     type: string
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsImlhdCI6MTcwOTAyNTY3MzY1NiwiZXhwIjoxNzA5MDI1NjczOTU2fQ.0SR4p7cXlFwK45rky0TnI9kZhvyJJVezUYO4s9Mv03o
 *       '404':
 *         description: Error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 path:
 *                  type: string
 *                  description: routes path
 *                  example: /login
 *                 statusCode:
 *                  type: integer
 *                  description: http code of the response
 *                  example: 404
 *                 error:
 *                  type: string
 *                  description: error type
 *                  example: resource not found
 *                 success:
 *                  type: boolean
 *                  description: status of the reponses
 *                  example: false
 *                 statusText:
 *                  type: string
 *                  example: Not found
 *                 message:
 *                  type: string
 *                  description: message of the error
 *                  example: Wrong credentials
 */
r.post(
    '/login',
    [body('secretKey').isString(), body('serviceKey').isString()],
    login
);

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: refresh jwt
 *     tags: [Authentication]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             refreshToken:
 *               description: refresh token
 *               type: string
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                  type: string
 *                  description: timestamp of the response
 *                  example: 1709025673657
 *                 code:
 *                  type: integer
 *                  description: http code of the response
 *                  example: 200
 *                 content:
 *                  type: object
 *                  properties:
 *                   token:
 *                     type: string
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsImlhdCI6MTcwOTAyNTY3MzY1NCwiZXhwIjoxNzA5MDI1NjczOTU0fQ.WI2KCtxOvnoffBgB5QSYL5ClDLblKORAcYb5SQR-Nqw
 *       '404':
 *         description: Error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 path:
 *                  type: string
 *                  description: routes path
 *                  example: /login
 *                 statusCode:
 *                  type: integer
 *                  description: http code of the response
 *                  example: 404
 *                 error:
 *                  type: string
 *                  description: error type
 *                  example: resource not found
 *                 success:
 *                  type: boolean
 *                  description: status of the reponses
 *                  example: false
 *                 statusText:
 *                  type: string
 *                  example: Not found
 *                 message:
 *                  type: string
 *                  description: message of the error
 *                  example: Wrong credentials
 */
r.post('/refresh', refresh);

/**
 * @swagger
 * /regenerate:
 *   post:
 *     summary: regenerate jwt and resfresh token
 *     tags: [Authentication]
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             refreshToken:
 *               description: refresh token
 *               type: string
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                  type: string
 *                  description: timestamp of the response
 *                  example: 1709025673657
 *                 code:
 *                  type: integer
 *                  description: http code of the response
 *                  example: 200
 *                 content:
 *                  type: object
 *                  properties:
 *                   token:
 *                     type: string
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsImlhdCI6MTcwOTAyNTY3MzY1NCwiZXhwIjoxNzA5MDI1NjczOTU0fQ.WI2KCtxOvnoffBgB5QSYL5ClDLblKORAcYb5SQR-Nqw
 *                   refreshToken:
 *                     type: string
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlS2V5IjoiMXRBVGlLN0UzQTFIM2Rfd0lpVVhPdExDS2tXWlpLQV9wMlgwZ3drRG1GeHBmQ0Y0STNJc2xyZG1rUERfMzhhVFRyQXpJUVVMaXhVV2NCSWxCRnlCY3lVOHN4RFJVWk1YX09UYyIsImlhdCI6MTcwOTAyNTY3MzY1NCwiZXhwIjoxNzA5MDI1NjczOTU0fQ.WI2KCtxOvnoffBgB5QSYL5ClDLblKORAcYb5SQR-Nqw
 *       '404':
 *         description: Error response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 path:
 *                  type: string
 *                  description: routes path
 *                  example: /login
 *                 statusCode:
 *                  type: integer
 *                  description: http code of the response
 *                  example: 404
 *                 error:
 *                  type: string
 *                  description: error type
 *                  example: resource not found
 *                 success:
 *                  type: boolean
 *                  description: status of the reponses
 *                  example: false
 *                 statusText:
 *                  type: string
 *                  example: Not found
 *                 message:
 *                  type: string
 *                  description: message of the error
 *                  example: Wrong credentials
 */
r.post('/regenerate', regenerate);

export default r;
