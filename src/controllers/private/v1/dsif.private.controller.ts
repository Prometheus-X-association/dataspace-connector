import axios from 'axios';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getConfigFile } from '../../../libs/loaders/configuration';

/**
 * Generate a base64 encoded offer ID
 * @param contractDefinitionId - The contract definition ID
 * @param assetId - The asset ID
 * @returns Base64 encoded offer ID
 */
const generateOfferIdBase64 = (
    contractDefinitionId: string,
    assetId: string
): string => {
    const uuid = crypto.randomUUID().replace(/-/g, '');
    const uuidBase64 = Buffer.from(uuid).toString('base64');
    const contractDefinitionIdBase64 =
        Buffer.from(contractDefinitionId).toString('base64');
    const assetIdBase64 = Buffer.from(assetId).toString('base64');
    return `${contractDefinitionIdBase64}:${assetIdBase64}:${uuidBase64}`;
};

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

        if (!offer['edc:contractDefinitionId']) {
            return res.status(400).json({
                error: 'Invalid offer: missing edc:contractDefinitionId',
            });
        }
        if (!offer['dspace:assetId']) {
            return res.status(400).json({
                error: 'Invalid offer: missing dspace:assetId',
            });
        }

        const clientId = consumerPid.split('_')[0];

        const body = {
            '@context': ['https://w3id.org/dspace/2025/1/context.jsonld'],
            '@type': 'ContractRequestMessage',
            consumerPid: consumerPid,
            callbackAddress: `${getConfigFile()?.endpoint}/dsif`,
            offer: {
                '@id': generateOfferIdBase64(
                    offer['edc:contractDefinitionId'] || '',
                    offer['dspace:assetId'] || ''
                ),
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
                Authorization: `{ "clientId": "${clientId}", "region": "eu" }`,
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
