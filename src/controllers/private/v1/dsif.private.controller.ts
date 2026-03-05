import axios from 'axios';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getConfigFile } from '../../../libs/loaders/configuration';

export const DsifNegotiation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { offer, consumerPid } = req.body;

        if (!offer) {
            return res.status(400).json({
                error: 'Invalid request: missing offer in body',
            });
        }
        if (!consumerPid) {
            return res.status(400).json({
                error: 'Invalid request: missing consumerPid in body',
            });
        }

        const edcEndpoint =
            offer['dsif:negotiation']['dspace:protocolEndpoint'] +
            '/2025-1/negotiations/request';

        if (!edcEndpoint) {
            return res.status(400).json({
                error: 'Invalid offer: missing dsif:negotiation or dspace:protocolEndpoint',
            });
        }

        const body = {
            '@context': ['https://w3id.org/dspace/2025/1/context.jsonld'],
            '@type': 'ContractRequestMessage',
            consumerPid: consumerPid,
            callbackAddress: `${getConfigFile().endpoint}/dsif`,
            offer: {
                '@id': `${offer['edc:contractDefinitionId']}:${
                    offer['dspace:assetId']
                }:${crypto.randomUUID().replace(/-/g, '')}`,
                '@type': 'odrl:Offer',
                'odrl:permission': [
                    {
                        'odrl:action': 'odrl:use',
                    },
                ],
                'odrl:target': {
                    '@id': offer['dspace:assetId'],
                },
            },
        };

        const axiosRes = await axios.post(edcEndpoint, body, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `{ "clientId": "${consumerPid}", "region": "eu" }`,
            },
        });

        return res.status(200).json({
            message: 'Negotiation request sent successfully',
            edcResponse: axiosRes.data,
        });
    } catch (error) {
        next(error);
    }
};
