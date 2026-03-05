import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { getConfigFile } from '../../../libs/loaders/configuration';

export const DsifNegotiationAgreement = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { consumerPid } = req.params;
        const { agreement, providerPid, callbackAddress } = req.body;

        if (!consumerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing consumerPid in params',
            });
        }

        const contract = await axios.put(
            `${getConfigFile().contractUri}dsp/${consumerPid}`,
            {
                state: 'AGREED',
                providerPid,
                agreement,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!callbackAddress && !contract.data.callbackAddress) {
            return res.status(200).json({
                message: `Negotiation agreement for consumerPid ${consumerPid} received`,
            });
        }

        res.status(200).json({
            message: `Negotiation agreement for consumerPid ${consumerPid} received`,
        });

        await axios.post(
            `${
                callbackAddress || contract.data.callbackAddress
            }/2025-1/negotiations/${providerPid}/agreement/verification`,
            {
                '@context': ['https://w3id.org/dspace/2025/1/context.jsonld'],
                '@type': 'ContractAgreementVerificationMessage',
                providerPid,
                consumerPid,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `{ "clientId": "${consumerPid}", "region": "eu" }`,
                },
            }
        );
    } catch (error) {
        next(error);
    }
};

export const DsifNegotiationEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { consumerPid } = req.params;
        const { eventType } = req.body;

        if (!consumerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing consumerPid in params',
            });
        }

        await axios.put(
            `${getConfigFile().contractUri}dsp/${consumerPid}`,
            {
                state: eventType,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return res.status(200).json({
            message: `Negotiation event ${eventType} for consumerPid ${consumerPid} received`,
        });
    } catch (error) {
        next(error);
    }
};

export const DsifNegotiationTermination = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { consumerPid } = req.params;

        if (!consumerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing consumerPid in params',
            });
        }

        await axios.put(
            `${getConfigFile().contractUri}dsp/${consumerPid}`,
            {
                state: 'TERMINATED',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return res.status(200).json({
            message: `Negotiation termination for consumerPid ${consumerPid} received`,
        });
    } catch (error) {
        next(error);
    }
};
