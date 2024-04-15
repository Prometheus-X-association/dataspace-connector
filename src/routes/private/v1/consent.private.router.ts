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
    giveConsent,
    revokeConsent,
} from '../../../controllers/private/v1/consent.private.controller';
import {body} from "express-validator";
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
 *             userId:
 *               required: true
 *               description: user id from your system
 *               type: string
 *             email:
 *               description: email to reattach the user
 *               type: string
 *             data:
 *               required: true
 *               description: selected data
 *               type: array
 *               items:
 *                  type: string
 *
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/', [
    body('data').isArray().exists(),
    body('privacyNoticeId').exists(),
    body('userId').exists(),
], giveConsent);

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
r.get("/exchanges/:as", auth, getAvailableExchanges);

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

/**
 * @swagger
 * /private/consent/{userId}/{consentId}:
 *   delete:
 *     summary: revoke consent by id
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
 *        - name: consentId
 *          description: consent id to revoke.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
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
 *        - name: userId
 *          description: internal id.
 *          in: path
 *          required: true
 *          type: string
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
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               required: true
 *               description: user id from your system
 *               type: string
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

export default r;
