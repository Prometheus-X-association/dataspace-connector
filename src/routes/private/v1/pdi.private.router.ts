import { Router } from 'express';
import {
    getAvailableExchanges,
    getUserPrivacyNotices,
} from '../../../controllers/private/v1/consent.private.controller';
import { customCorsOptions } from '../../../config/cors';
import { pdiMiddleware } from '../../middlewares/pdi.middleware';
import cors from 'cors';
import { auth } from '../../middlewares/auth.middleware';
import { getIframeURL } from '../../../controllers/private/v1/pdi.private.controller';

const r: Router = Router();
/**
 * @swagger
 * tags:
 *   name: PDI
 *   description: PDI routes
 */

/**
 * @swagger
 * /private/pdi:
 *   get:
 *     summary: get the iframe url
 *     tags: [PDI]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: privacyNoticeId
 *          description: privacy notice id.
 *          in: query
 *          required: false
 *          type: string
 *        - name: userId
 *          description: user id.
 *          in: query
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/', auth, getIframeURL);

r.get(
    '/exchanges/:as',
    cors(customCorsOptions),
    pdiMiddleware,
    getAvailableExchanges
);

// r.get('/:userId/privacy-notices/:privacyNoticeId', cors(customCorsOptions), pdiMiddleware, getUserPrivacyNoticeById);

r.get(
    '/:userId/:providerSd/:consumerSd',
    cors(customCorsOptions),
    pdiMiddleware,
    getUserPrivacyNotices
);

export default r;
