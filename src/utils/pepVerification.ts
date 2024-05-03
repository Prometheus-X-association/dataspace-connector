import { PEP } from '../access-control/PolicyEnforcementPoint';
import axios from 'axios';
import { Regexes } from './regexes';
import { Logger } from '../libs/loggers';
import { FetchConfig } from '../access-control/PolicyFetcher';
import { config } from '../config/environment';
import jwt from 'jsonwebtoken';
import { getEndpoint } from '../libs/loaders/configuration';
import { urlChecker } from './urlChecker';

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
            contract.data.serviceOfferings?.length > 0
        ) {
            dataPath = 'serviceOfferings.policies';
            const target = params.targetResource;

            if (RegExp(Regexes.http).exec(target)) {
                // Split the string by backslash and get the last element
                const pathElements = params.targetResource.split('/');
                resourceID = pathElements[pathElements.length - 1];
            } else {
                resourceID = params.targetResource;
            }
        } else {
            dataPath = 'policy';
            const target = params.targetResource;

            if (!RegExp(Regexes.http).exec(target)) {
                // Split the string by backslash and get the last element
                const pathElements = params.targetResource.split('/');
                resourceID = pathElements[pathElements.length - 1];
            } else {
                resourceID = params.targetResource;
            }
        }
        const contractID = Buffer.from(contractSD).toString('base64');
        const token = jwt.sign({ internal: true }, config.jwtInternalSecretKey);

        const success = await PEP.requestAction({
            action: 'use',
            targetResource: params.targetResource,
            referenceURL: contractSD,
            referenceDataPath: dataPath,
            fetcherConfig: {
                count: {
                    url: urlChecker(
                        await getEndpoint(),
                        `internal/leftoperands/count/${contractID}/${resourceID}`
                    ),
                    remoteValue: 'content.count',
                    token,
                },
            } as { [key: string]: FetchConfig },
        });
        return { pep: success, contractID, resourceID };
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
        throw e;
    }
};

export const pepLeftOperandsVerification = async (params: {
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
            contract.data.serviceOfferings?.length > 0
        ) {
            const target = params.targetResource;

            if (RegExp(Regexes.http).exec(target)) {
                // Split the string by backslash and get the last element
                const pathElements = params.targetResource.split('/');
                resourceID = pathElements[pathElements.length - 1];
            } else {
                resourceID = params.targetResource;
            }
        } else {
            const target = params.targetResource;

            if (!RegExp(Regexes.http).exec(target)) {
                // Split the string by backslash and get the last element
                const pathElements = params.targetResource.split('/');
                resourceID = pathElements[pathElements.length - 1];
            } else {
                resourceID = params.targetResource;
            }
        }
        const contractID = Buffer.from(contractSD).toString('base64');
        const token = jwt.sign({ internal: true }, config.jwtInternalSecretKey);

        return await PEP.listResourceLeftOperands({
            targetResource: params.targetResource,
            fetcherConfig: {
                count: {
                    url: urlChecker(
                        await getEndpoint(),
                        `internal/leftoperands/count/${contractID}/${resourceID}`
                    ),
                    remoteValue: 'content.count',
                    token,
                },
            } as { [key: string]: FetchConfig },
        });
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
        throw e;
    }
};
