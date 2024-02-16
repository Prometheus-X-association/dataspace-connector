import { PEP } from '../access-control/PolicyEnforcementPoint';
import axios from 'axios';
import { Regexes } from './regexes';
import { Logger } from '../libs/loggers';
import { FetchConfig } from '../access-control/PolicyFetcher';
import { config } from '../config/environment';
import jwt from 'jsonwebtoken';

/**
 * PEP verification with the decrypted consent
 * @param params
 */
export const pepVerification = async (params: {
    targetResource: string;
    referenceURL: string;
}) => {
    const contractSD = params.referenceURL;
    let resourceID;
    let dataPath;

    try {
        const contract = await axios.get(contractSD);

        if (
            contractSD.includes('contracts') &&
            contract.data.serviceOfferings.length > 0
        ) {
            dataPath = 'serviceOfferings.policies';
            const target =
                contract.data.serviceOfferings[0].policies[0].permission[0]
                    .target;

            if (!target.match(Regexes.http)) {
                // Split the string by backslash and get the last element
                const pathElements = params.targetResource.split('/');
                resourceID = pathElements[pathElements.length - 1];
            } else {
                resourceID = params.targetResource;
            }
        } else {
            dataPath = 'policy';
            const target = contract.data.policy[0].permission[0].target;

            if (!target.match(Regexes.http)) {
                // Split the string by backslash and get the last element
                const pathElements = params.targetResource.split('/');
                resourceID = pathElements[pathElements.length - 1];
            } else {
                resourceID = params.targetResource;
            }
        }
        const contractID = '?'; // Todo: contract id
        const token = jwt.sign({ internal: true }, config.jwtInternalSecretKey);
        const success = await PEP.requestAction({
            action: 'use',
            targetResource: resourceID,
            referenceURL: contractSD,
            referenceDataPath: dataPath,
            fetcherConfig: {
                count: {
                    url: `http://localhost:${config.port}/leftoperands/count/${contractID}/${resourceID}`,
                    remoteValue: 'content.count',
                    token,
                },
            } as { [key: string]: FetchConfig },
        });
        // Todo: Implement count process for updating its value;
        // This process should be called after accessing the target resource.
        return success;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};
