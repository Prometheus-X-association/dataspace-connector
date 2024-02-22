import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import {
    consentDataExchange,
    getMyConsent,
    getMyConsentById,
    getUserConsent,
    getUserConsentById,
    getUserPrivacyNoticeById,
    getUserPrivacyNotices,
    giveConsent,
} from '../../../controllers/private/v1/consent.private.controller';
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Consent
 *   description: Private routes for the consent
 */

/**
 * @swagger
 * /private/consent/:
 *   post:
 *     summary: Give consent
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: triggerDataExchange
 *          description: trigger the data exchange in the same time than the consent.
 *          in: query
 *          required: false
 *          type: boolean
 *          example: true
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             privacyNoticeId:
 *               required: true
 *               description: privacy notice id
 *               type: string
 *               example: 65d747917cd550689dd06c29
 *             userId:
 *               required: true
 *               description: internal user id
 *               type: string
 *               example: 65d7405e317a3078d12025f6
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/', giveConsent);

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
 *          description: internal user id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d7405e317a3078d12025f6
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/me', auth, getMyConsent);

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
 *          example: 65d747917cd550689dd06c29
 *        - name: userId
 *          description: internal user id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d7405e317a3078d12025f6
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/me/:id', auth, getMyConsentById);

/**
 * @swagger
 * /private/consent/{userId}/privacy-notices/{privacyNoticeId}:
 *   get:
 *     summary: Get user privacy notices
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: privacyNoticeId
 *          description: privacy notice id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d747917cd550689dd06c29
 *        - name: userId
 *          description: internal id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d7405e317a3078d12025f6
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/privacy-notices/:privacyNoticeId', getUserPrivacyNoticeById);

/**
 * @swagger
 * /private/consent/{consentId}/data-exchange:
 *   post:
 *     summary: Trigger the data exchange by the user based on a consent
 *     tags: [Consent]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: consentId
 *          description: consent id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d747917cd550689dd06c29
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               required: true
 *               description: internal user id
 *               type: string
 *               example: 65d7405e317a3078d12025f6
 *     responses:
 *       '200':
 *         description: Successful response
 */
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
 *          description: internal user id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d7405e317a3078d12025f6
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
 *          description: internal user id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d7405e317a3078d12025f6
 *        - name: id
 *          description: consent id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d747917cd550689dd06c29
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
 *          example: aHR0cDovL2hvc3QuZG9ja2VyLmludGVybmFsOjQwNDAvdjEvY2F0YWxvZy9wYXJ0aWNpcGFudHMvNjU2NGFiYjVkODUzZThlMDViMTMyMDU3
 *        - name: consumerSd
 *          description: consumer self-description in base64.
 *          in: path
 *          required: true
 *          type: string
 *          example: aHR0cDovL2hvc3QuZG9ja2VyLmludGVybmFsOjQwNDAvdjEvY2F0YWxvZy9wYXJ0aWNpcGFudHMvNjU2NGFhZWJkODUzZThlMDViMTMxN2Mx
 *        - name: userId
 *          description: internal user id.
 *          in: path
 *          required: true
 *          type: string
 *          example: 65d7405e317a3078d12025f6
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:userId/:providerSd/:consumerSd', auth, getUserPrivacyNotices);

export default r;
