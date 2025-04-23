import { Request, Response } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { postAccessToken } from '../../../libs/third-party/postAccessToken';
import { postDataRequest } from '../../../libs/third-party/postDataRequest';
import * as crypto from 'crypto';
import { Logger } from '../../../libs/loggers';
import { User } from '../../../utils/types/user';
import {
    consentServiceParticipantLogin,
    consentServiceUserLogin,
} from '../../../libs/third-party/consent';
import { DataExchange } from '../../../utils/types/dataExchange';
import { handle } from '../../../libs/loaders/handler';
import axios from 'axios';
import { getEndpoint } from '../../../libs/loaders/configuration';

/**
 * export the consent
 * @param req
 * @param res
 */
export const exportConsent = async (req: Request, res: Response) => {
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

        //Create a data Exchange
        let dataExchange;
        if (decryptedConsent.contract.includes('contracts')) {
            dataExchange = await DataExchange.create({
                consumerEndpoint:
                    decryptedConsent.dataConsumer.dataspaceEndpoint,
                resources: decryptedConsent.data,
                purposeId: decryptedConsent.purposes[0].resource,
                contract: decryptedConsent.contract,
                status: 'PENDING',
                createdAt: new Date(),
                serviceChain: decryptedConsent.recipientThirdParties,
            });
        } else {
            dataExchange = await DataExchange.create({
                consumerEndpoint:
                    decryptedConsent.dataConsumer.dataspaceEndpoint,
                resources: decryptedConsent.data,
                purposeId: decryptedConsent.purposes[0].resource,
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
        await dataExchange.createDataExchangeToOtherParticipant('consumer');

        if (
            dataExchange?.serviceChain &&
            dataExchange?.serviceChain?.services &&
            dataExchange?.serviceChain?.services.length > 0
        ) {
            for (const service of dataExchange.serviceChain.services) {
                // Get the infrastructure service information
                const [participantResponse] = await handle(
                    axios.get(service.participant)
                );

                // Find the participant endpoint
                const participantEndpoint =
                    participantResponse.dataspaceEndpoint;

                if (
                    participantEndpoint !== dataExchange.consumerEndpoint &&
                    participantEndpoint !== (await getEndpoint())
                ) {
                    // Sync the data exchange with the infrastructure
                    await dataExchange.syncWithInfrastructure(
                        participantEndpoint
                    );
                }
            }
        }

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
 */
export const importConsent = async (req: Request, res: Response) => {
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
 * @deprecated
 */
export const consentUserLogin = async (req: Request, res: Response) => {
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
 * @deprecated
 */
export const consentParticipantLogin = async (req: Request, res: Response) => {
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
