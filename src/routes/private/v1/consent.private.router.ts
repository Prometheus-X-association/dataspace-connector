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
import { consentJwtDecode } from '../../middlewares/consent.auth.middleware';
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
 *       - consentJwt: []
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               required: false
 *               description: User email
 *               type: string
 *             data:
 *               required: false
 *               description: data
 *               type: string
 *             privacyNoticeId:
 *               required: true
 *               description: privacy notice id
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/', giveConsent);

/**
 * @swagger
 * /private/consent/me:
 *   get:
 *     summary: Get user consent
 *     tags: [Consent]
 *     security:
 *       - consentJwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/me', consentJwtDecode, getMyConsent);

/**
 * @swagger
 * /private/consent/me/{id}:
 *   get:
 *     summary: Get user consent by id
 *     tags: [Consent]
 *     security:
 *       - consentJwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: consent id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/me/:id', consentJwtDecode, getMyConsentById);

/**
 * @swagger
 * /private/consent/privacy-notices/{privacyNoticeId}:
 *   get:
 *     summary: Get user privacy notices
 *     tags: [Consent]
 *     security:
 *       - consentJwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: privacyNoticeId
 *          description: privacy notice id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/privacy-notices/:privacyNoticeId', getUserPrivacyNoticeById);

/**
 * @swagger
 * /private/consent/{consentId}/data-exchange:
 *   post:
 *     summary: Trigger the data exchange by the user based on a consent
 *     tags: [Consent]
 *     security:
 *       - consentJwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: consentId
 *          description: consent id.
 *          in: path
 *          required: true
 *          type: string
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
 *          description: dsc user id.
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
 *          description: dsc user id.
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
 * /private/consent/{providerId}/{consumerId}:
 *   get:
 *     summary: Get user privacy notices
 *     tags: [Consent]
 *     security:
 *       - consentJwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: providerId
 *          description: provider id.
 *          in: path
 *          required: true
 *          type: string
 *        - name: consumerId
 *          description: consumer id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:providerId/:consumerId', consentJwtDecode, getUserPrivacyNotices);

export default r;
