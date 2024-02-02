import { Request, Response, NextFunction } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { postAccessToken } from '../../../libs/services/postAccessToken';
import { postDataRequest } from '../../../libs/services/postDataRequest';
import * as crypto from 'crypto';
import { Logger } from '../../../libs/loggers';

/**
 * export the consent
 * @param req
 * @param res
 * @param next
 */
export const exportConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body?.signedConsent || !req.body?.encrypted)
            return res.status(400).json({
                error: 'Missing body params from the request payload',
            });

        // Generate access token
        const token = crypto.randomUUID();

        // Send OK response to requester
        res.status(200).json({ message: 'OK', token });

        // Decrypt signed consent
        const decryptedConsent = await decryptSignedConsent(
            req.body.signedConsent,
            req.body.encrypted
        );

        const { _id } = decryptedConsent;

        // POST access token to VisionsTrust
        await postAccessToken(_id, token);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
    }
};

/**
 * import the consent
 * @param req
 * @param res
 * @param next
 */
export const importConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // [opt] verify req.body for wanted information
        const { dataProviderEndpoint, signedConsent, encrypted } = req.body;
        if (!dataProviderEndpoint || !signedConsent || !encrypted)
            return res.status(400).json({
                error: 'missing params from request payload',
            });

        // Send OK response to requester
        res.status(200).json({ message: 'OK' });

        // POST data request with signedConsent from body to the export service endpoint specified in payload
        await postDataRequest(req.body);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
    }
};
