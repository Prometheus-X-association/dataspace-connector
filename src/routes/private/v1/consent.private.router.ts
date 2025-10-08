import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import {
    consentDataExchange,
    getAvailableExchanges,
    getMyConsent,
    getMyConsentById,
    getUserConsent,
    getUserConsentById,
    getUserPrivacyNoticeById,
    getUserPrivacyNotices,
    getUserPrivacyNoticesByContract,
    giveConsent,
    revokeConsent,
} from '../../../controllers/private/v1/consent.private.controller';
import { body } from 'express-validator';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consent
 *   description: Private routes for the consent
 */

r.post(
    '/',
    [
        body('data').isArray().exists(),
        body('privacyNoticeId').exists(),
        body('serviceChainId').optional(),
        body('userId').exists(),
    ],
    giveConsent
);

/**
 * @swagger
 * /private/consent/exchanges/{as}:
 *   get:
 *     summary: Get available exchanges
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: as
 *          description: as provider or consumer.
 *          in: path
 *          required: true
 *          type: string
 *        - name: userId
 *          description: internal id.
 *          in: query
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/exchanges/:as', auth, getAvailableExchanges);

/**
 * @swagger
 * /private/consent/{userId}/me:
 *   get:
 *     summary: Get user consent
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: userId
 *          description: your internal id inside your app / database for the user.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/me', auth, getMyConsent);

r.delete('/:userId/:consentId', auth, revokeConsent);

/**
 * @swagger
 * /private/consent/{userId}/me/{id}:
 *   get:
 *     summary: Get user consent by id
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: consent id.
 *          in: path
 *          required: true
 *          type: string
 *        - name: userId
 *          description: your internal id inside your app / database for the user.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/me/:id', auth, getMyConsentById);

r.get('/:userId/privacy-notices/:privacyNoticeId', getUserPrivacyNoticeById);

r.post('/:consentId/data-exchange', consentDataExchange);

/**
 * @swagger
 * /private/consent/participants/{userId}:
 *   get:
 *     summary: Get user consent
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: userId
 *          description: your internal id inside your app / database for the user.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/participants/:userId', auth, getUserConsent);

/**
 * @swagger
 * /private/consent/participants/{userId}/{id}:
 *   get:
 *     summary: Get user consent
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: userId
 *          description: your internal id inside your app / database for the user.
 *          in: path
 *          required: true
 *          type: string
 *        - name: id
 *          description: consent id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/participants/:userId/:id', auth, getUserConsentById);

/**
 * @swagger
 * /private/consent/{userId}/{providerSd}/{consumerSd}:
 *   get:
 *     summary: Get user privacy notices
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: providerSd
 *          description: provider self-description in base64.
 *          in: path
 *          required: true
 *          type: string
 *        - name: consumerSd
 *          description: consumer self-description in base64.
 *          in: path
 *          required: true
 *          type: string
 *        - name: userId
 *          description: your internal id inside your app / database for the user.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/:providerSd/:consumerSd', auth, getUserPrivacyNotices);

/**
 * @swagger
 * /private/consent/{userId}/{providerSd}/{consumerSd}/{contractSd}:
 *   get:
 *     summary: Get user privacy notices by contract
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: contractSd
 *          description: contract self-description in base64.
 *          in: path
 *          required: true
 *          type: string
 *        - name: providerSd
 *          description: provider self-description in base64.
 *          in: path
 *          required: true
 *          type: string
 *        - name: consumerSd
 *          description: consumer self-description in base64.
 *          in: path
 *          required: true
 *          type: string
 *        - name: userId
 *          description: your internal id inside your app / database for the user.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get(
    '/:userId/:providerSd/:consumerSd/:contractSd',
    auth,
    getUserPrivacyNoticesByContract
);

export default r;
