import { Request, Response, NextFunction } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { postAccessToken } from '../../../libs/services/postAccessToken';
import { postDataRequest } from '../../../libs/services/postDataRequest';
import * as crypto from 'crypto';
import { Logger } from '../../../libs/loggers';
import { User } from '../../../utils/types/user';
import {
    consentServiceParticipantLogin,
    consentServiceUserLogin,
} from '../../../libs/services/consent';
import { getContract } from '../../../libs/services/contract';
import { handle } from '../../../libs/loaders/handler';
import { DataExchange } from '../../../utils/types/dataExchange';

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

        // Decrypt signed consent
        const decryptedConsent = await decryptSignedConsent(
            req.body.signedConsent,
            req.body.encrypted
        );

        // retrieve contract
        const [contractResponse] = await handle(
            getContract(decryptedConsent.contract)
        );

        //Create a data Exchange
        let dataExchange;
        if (decryptedConsent.contract.includes('contracts')) {
            dataExchange = await DataExchange.create({
                consumerEndpoint:
                    decryptedConsent.dataConsumer.dataspaceEndpoint,
                resourceId: decryptedConsent.data[0],
                purposeId: decryptedConsent.purposes[0].purpose,
                contract: decryptedConsent.contract,
                status: 'PENDING',
                createdAt: new Date(),
            });
        } else {
            dataExchange = await DataExchange.create({
                consumerEndpoint:
                    decryptedConsent.dataConsumer.dataspaceEndpoint,
                resourceId: contractResponse.serviceOffering,
                purposeId: contractResponse.purpose[0].purpose,
                contract: decryptedConsent.contract,
                status: 'PENDING',
                createdAt: new Date(),
            });
        }

        // Send OK response to requester
        res.status(200).json({
            message: 'OK',
            token,
            dataExchangeId: dataExchange._id,
        });

        // Create the data exchange at the provider
        // @ts-ignore
        await dataExchange.createDataExchangeToOtherParticipant('consumer');

        const { _id } = decryptedConsent;

        // POST access token to VisionsTrust
        await postAccessToken(_id, token, dataExchange._id.toString());
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

/**
 * Log the user to the consent manager
 * @param req
 * @param res
 * @param next
 */
export const consentUserLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email,
        });

        const response = await consentServiceUserLogin(email, password);

        if (response._id && !user.consentID) {
            user.consentID = response._id;
            user.save();
        }

        res.status(200).json(response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
    }
};

/**
 * Log the participant to the consent manager
 * @param req
 * @param res
 * @param next
 */
export const consentParticipantLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceParticipantLogin();
        res.status(200).json(response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
    }
};
