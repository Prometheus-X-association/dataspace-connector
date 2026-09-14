import { Router } from 'express';
import { body, param } from 'express-validator';
import {
    authorizeControlPlaneExchange,
    createConsentControlPlaneExchangeRequest,
    createControlPlaneExchangeRequest,
    getControlPlaneExchangeRequest,
    reportControlPlaneExchangeTransfer,
} from '../../../controllers/public/v1/controlplane.public.controller';
import { isControlPlaneEnabled } from '../../../libs/loaders/configuration';
import { auth } from '../../middlewares/auth.middleware';
import { authKeyCheck } from '../../middlewares/exchangeTrigger.middleware';
import { validate } from '../../middlewares/validator.middleware';

const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Control Plane
 *   description: Optional contract, consent, and policy authorization for participant-managed transfers
 */

/**
 * @swagger
 * /controlplane/exchanges:
 *   post:
 *     summary: Create a control-plane exchange without transferring data
 *     tags: [Control Plane]
 *     security:
 *       - jwt: []
 *     responses:
 *       '201':
 *         description: Exchange context created and synchronized with the peer connector
 *       '404':
 *         description: Control-plane workflow is disabled
 */
r.use(async (req, res, next) => {
    try {
        if (!(await isControlPlaneEnabled())) {
            return res
                .status(404)
                .json({ error: 'Control-plane workflow is disabled' });
        }
        next();
    } catch (err) {
        next(err);
    }
});

r.post(
    '/exchanges',
    auth,
    [
        body('contract').isString(),
        body('purposeId').isString().optional(),
        body('resourceId').isString().optional(),
        body('resources').isArray().optional(),
        body('purposes').isArray().optional(),
        body('providerParams').isObject().optional(),
        body('consumerParams').isObject().optional(),
        body('serviceChainId').isString().optional(),
        body('serviceChainParams').isArray().optional(),
        body('callbackUrl')
            .isURL({ protocols: ['https', 'http'], require_protocol: true,  require_tld: false })
            .withMessage('callbackUrl must be a valid HTTPS or HTTP URL')
            .optional(),
    ],
    validate,
    createControlPlaneExchangeRequest
);

/**
 * @swagger
 * /controlplane/exchanges/external/trigger:
 *   post:
 *     summary: Create a control-plane exchange with the external trigger API key
 *     tags: [Control Plane]
 *     security:
 *       - exchangeTriggerAPIKey: []
 *     responses:
 *       '201':
 *         description: Exchange context created and synchronized with the peer connector
 */
r.post(
    '/exchanges/external/trigger',
    authKeyCheck,
    [
        body('contract').isString(),
        body('purposeId').isString().optional(),
        body('resourceId').isString().optional(),
        body('resources').isArray().optional(),
        body('purposes').isArray().optional(),
        body('providerParams').isObject().optional(),
        body('consumerParams').isObject().optional(),
        body('serviceChainId').isString().optional(),
        body('serviceChainParams').isArray().optional(),
        body('callbackUrl')
            .isURL({ protocols: ['https', 'http'], require_protocol: true,  require_tld: false })
            .withMessage('callbackUrl must be a valid HTTPS or HTTP URL')
            .optional(),
    ],
    validate,
    createControlPlaneExchangeRequest
);

/**
 * @swagger
 * /controlplane/exchanges/{id}:
 *   get:
 *     summary: Get a control-plane exchange status
 *     tags: [Control Plane]
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Current control-plane exchange context and metadata-only state
 *       '404':
 *         description: Control-plane exchange not found
 */
r.get(
    '/exchanges/:id',
    auth,
    [param('id').isMongoId()],
    validate,
    getControlPlaneExchangeRequest
);

/**
 * @swagger
 * /controlplane/exchanges/{id}/authorize:
 *   post:
 *     summary: Reauthorize a provider or consumer before a direct transfer
 *     tags: [Control Plane]
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Participant is authorized after current policy and consent checks
 *       '403':
 *         description: Participant is not authorized
 */
r.post(
    '/exchanges/:id/authorize',
    auth,
    [
        param('id').isMongoId(),
        body('participant').isIn(['provider', 'consumer']),
        body('signedConsent').isString().optional(),
        body('encrypted').isString().optional(),
    ],
    validate,
    authorizeControlPlaneExchange
);

/**
 * @swagger
 * /controlplane/consent/exchanges:
 *   post:
 *     summary: Create a consent-driven control-plane exchange without transferring data
 *     tags: [Control Plane]
 *     security:
 *       - jwt: []
 *     responses:
 *       '201':
 *         description: Consent exchange context created after consent validation
 */
r.post(
    '/consent/exchanges',
    auth,
    [
        body('signedConsent').isString(),
        body('encrypted').isString(),
        body('callbackUrl')
            .isURL({ protocols: ['https'], require_protocol: true })
            .optional(),
    ],
    validate,
    createConsentControlPlaneExchangeRequest
);

/**
 * @swagger
 * /controlplane/exchanges/{id}/transfer:
 *   post:
 *     summary: Report metadata-only direct transfer completion or failure
 *     tags: [Control Plane]
 *     security:
 *       - jwt: []
 *     responses:
 *       '200':
 *         description: Transfer status recorded and synchronized with the peer connector
 */
r.post(
    '/exchanges/:id/transfer',
    auth,
    [
        param('id').isMongoId(),
        body('participant').isIn(['provider', 'consumer']),
        body('success').isBoolean(),
        body('metadata').isObject().optional(),
        body('metadata.checksum').isString().optional(),
        body('metadata.mimetype').isString().optional(),
        body('metadata.size').isInt({ min: 0 }).optional(),
    ],
    validate,
    reportControlPlaneExchangeTransfer
);

export default r;
