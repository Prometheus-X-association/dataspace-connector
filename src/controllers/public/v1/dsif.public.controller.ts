import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { getConfigFile } from '../../../libs/loaders/configuration';
import { getContractServiceHeaders } from '../../../utils/dsif.utils';
import crypto from 'crypto';
import { urlChecker } from '../../../utils/urlChecker';

//#region Consumer Controllers
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
            `${getConfigFile()?.contractUri}dsp/${consumerPid}`,
            {
                state: 'AGREED',
                providerPid,
                agreement,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-ptx-catalog-key': process.env.X_PTX_CATALOG_KEY,
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

        sendAgreementVerification(
            callbackAddress || contract.data.callbackAddress,
            providerPid,
            consumerPid
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
            `${getConfigFile()?.contractUri}dsp/${consumerPid}`,
            {
                state: eventType,
            },
            {
                headers: getContractServiceHeaders(),
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
            `${getConfigFile()?.contractUri}dsp/${consumerPid}`,
            {
                state: 'TERMINATED',
            },
            {
                headers: getContractServiceHeaders(),
            }
        );

        return res.status(200).json({
            message: `Negotiation termination for consumerPid ${consumerPid} received`,
        });
    } catch (error) {
        next(error);
    }
};
//#endregion

//#region Provider Controllers
export const DsifNegotiationRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clientId = await getClientIdFromRequestHeader(req);
        const { consumerPid, callbackAddress, offer } = req.body;

        if (!clientId) {
            return res.status(401).json({
                error: 'Unauthorized: missing or invalid clientId in Authorization header',
            });
        }

        const currentConsumerPid =
            consumerPid ||
            req.body['dspace:consumerPid'] ||
            `${clientId}_${crypto.randomUUID()}`;
        const currentCallbackAddress =
            callbackAddress || req.body['dspace:callbackAddress'] || null;
        const currentOffer = offer || req.body['dspace:offer'] || null;

        const participantId = await getParticipantIdFromVisionsTrust();
        const providerPid = `${participantId}_${crypto.randomUUID()}`;

        const contract = await axios.post(
            `${getConfigFile()?.contractUri}dsp`,
            {
                contract: {
                    '@context': [
                        'https://w3id.org/dspace/2025/1/context.jsonld',
                    ],
                    '@type': 'ContractNegotiation',
                    consumerPid: currentConsumerPid,
                    providerPid,
                    state: 'REQUESTED',
                    offer: currentOffer,
                    callbackAddress: currentCallbackAddress || '',
                },
            },
            {
                headers: getContractServiceHeaders(),
            }
        );

        if (!contract.data) {
            return res.status(500).json({
                error: 'Failed to create contract negotiation',
            });
        }

        res.status(200).json({
            '@context': 'https://w3id.org/dspace/2025/1/context.jsonld',
            '@type': 'ContractNegotiation',
            providerPid: providerPid,
            consumerPid: currentConsumerPid,
            state: 'REQUESTED',
            'dspace:providerPid': providerPid,
            'dspace:consumerPid': currentConsumerPid,
            'dspace:state': 'dspace:REQUESTED',
        });

        if (currentCallbackAddress) {
            const targetId =
                currentOffer?.target ||
                currentOffer?.['odrl:target']?.['@id'] ||
                currentOffer?.['dspace:assetId'] ||
                '';

            try {
                await axios.post(
                    `${currentCallbackAddress}/negotiations/${currentConsumerPid}/agreement`,
                    {
                        '@context': [
                            'https://w3id.org/dspace/2025/1/context.jsonld',
                        ],
                        '@type': 'ContractAgreementMessage',
                        providerPid,
                        consumerPid: currentConsumerPid,
                        offer: currentOffer,
                        agreement: {
                            '@id': crypto.randomUUID(),
                            '@type': 'Agreement',
                            target: targetId,
                            timestamp: new Date().toISOString(),
                            assigner: participantId,
                            assignee: clientId,
                            'odrl:permission':
                                currentOffer?.['odrl:permission'] || [],
                            'odrl:prohibition': [],
                            'odrl:obligation': [],
                        },
                        callbackAddress: urlChecker(
                            `${getConfigFile()?.endpoint}`,
                            'dsif'
                        ),
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `{ "clientId": "${participantId}", "region": "eu" }`,
                        },
                    }
                );
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(
                    'Failed to send agreement to consumer callback address',
                    error
                );
            }
        }
    } catch (error) {
        next(error);
    }
};

export const DsifProviderNegotiationEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clientId = await getClientIdFromRequestHeader(req);
        const { providerPid } = req.params;
        const { eventType } = req.body;

        if (!clientId) {
            return res.status(401).json({
                error: 'Unauthorized: missing or invalid clientId in Authorization header',
            });
        }
        if (!providerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing providerPid in params',
            });
        }
        if (!eventType) {
            return res.status(400).json({
                error: 'Invalid request: missing eventType in body',
            });
        }

        await axios.put(
            `${getConfigFile()?.contractUri}dsp/${providerPid}`,
            {
                state: eventType,
            },
            {
                headers: getContractServiceHeaders(),
            }
        );

        return res.status(200).json({
            message: `Negotiation event ${eventType} for providerPid ${providerPid} received`,
        });
    } catch (error) {
        next(error);
    }
};

export const DsifNegotiationAgreementVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clientId = await getClientIdFromRequestHeader(req);
        const { providerPid } = req.params;
        const { consumerPid } = req.body;
        const participantId = await getParticipantIdFromVisionsTrust();

        if (!clientId) {
            return res.status(401).json({
                error: 'Unauthorized: missing or invalid clientId in Authorization header',
            });
        }
        if (!providerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing providerPid in params',
            });
        }
        if (!consumerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing consumerPid in body',
            });
        }

        res.status(200).json({
            message: `Agreement verification for providerPid ${providerPid} received`,
        });

        const callbackAddress = `${req.protocol}://${req.get('host')}`;

        await axios.post(
            `${callbackAddress}/negotiations/${consumerPid}/events`,
            {
                '@context': ['https://w3id.org/dspace/2025/1/context.jsonld'],
                '@type': 'ContractNegotiationEventMessage',
                providerPid,
                consumerPid,
                eventType: 'FINALIZED',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `{ "clientId": "${participantId}", "region": "eu" }`,
                },
            }
        );
    } catch (error) {
        next(error);
    }
};

export const DsifProviderNegotiationTermination = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const clientId = await getClientIdFromRequestHeader(req);
        const { providerPid } = req.params;

        if (!clientId) {
            return res.status(401).json({
                error: 'Unauthorized: missing or invalid clientId in Authorization header',
            });
        }
        if (!providerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing providerPid in params',
            });
        }

        await axios.put(
            `${getConfigFile()?.contractUri}dsp/${providerPid}`,
            {
                state: 'TERMINATED',
            },
            {
                headers: getContractServiceHeaders(),
            }
        );

        return res.status(200).json({
            message: `Negotiation termination for providerPid ${providerPid} received`,
        });
    } catch (error) {
        next(error);
    }
};
//#endregion

//#region Helper functions
/**
 * Send agreement verification in background after responding to client
 */
const sendAgreementVerification = async (
    callbackAddress: string,
    providerPid: string,
    consumerPid: string
) => {
    try {
        const clientId = consumerPid.split('_')[0];

        await axios.post(
            `${callbackAddress}/negotiations/${providerPid}/agreement/verification`,
            {
                '@context': ['https://w3id.org/dspace/2025/1/context.jsonld'],
                '@type': 'ContractAgreementVerificationMessage',
                providerPid,
                consumerPid,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `{ "clientId": "${clientId}", "region": "eu" }`,
                },
            }
        );
    } catch (error) {
        throw new Error('Failed to send agreement verification');
    }
};

const getParticipantIdFromVisionsTrust = async () => {
    try {
        const login = await axios.post(
            `${getConfigFile()?.catalogUri}auth/login/api`,
            {
                serviceKey: getConfigFile()?.serviceKey,
                serviceSecretKey: getConfigFile()?.secretKey,
            }
        );

        const token = login.data?.token;
        if (!token) {
            throw new Error('Failed to retrieve token from VisionsTrust');
        }

        const participant = await axios.get(
            `${getConfigFile()?.catalogUri}participants/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return participant.data?._id;
    } catch (error) {
        throw new Error('Failed to retrieve participant ID from VisionsTrust');
    }
};

const getClientIdFromRequestHeader = async (req: Request) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return null;
    }
    try {
        const authData = JSON.parse(authorization);
        return authData?.clientId || null;
    } catch (error) {
        return null;
    }
};
//#endregion
