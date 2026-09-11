import axios from 'axios';
import {
    getAppKey,
    getCatalogUri,
    getEndpoint,
    getProxy,
    getSecretKey,
    getServiceKey,
} from '../loaders/configuration';
import { generateBearerTokenFromSecret } from '../jwt';
import { handle } from '../loaders/handler';
import { urlChecker } from '../../utils/urlChecker';
import { Logger } from '../loggers';
import {checkConnectorProxy} from "./proxy";

export const getCatalogData = async (endpoint: string, options?: any) => {
    return axios.get(endpoint, {...options, ...(await checkConnectorProxy({
        configProxy: getProxy()
    }))});
};

/**
 * Register the self description
 * @returns The self description
 */
export const getParticipant = async () => {
    try {
        const catalogURI = await getCatalogUri();
        const endpoint = await getEndpoint();
        const appKey = await getAppKey();

        if (
            (await getServiceKey()) &&
            (await getSecretKey()) &&
            catalogURI &&
            endpoint
        ) {
            const { token } = await generateBearerTokenFromSecret();

            const [checkNeedRegister, checkNeedRegisterError] = await handle(
                axios.post(
                    urlChecker(catalogURI, 'participants/check'),
                    {
                        appKey,
                        endpoint,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        ...(await checkConnectorProxy({
                            configProxy: getProxy()
                        }))
                    }
                )
            );

            if (checkNeedRegisterError) {
                Logger.error({
                    message: checkNeedRegisterError.message,
                    location: checkNeedRegisterError.stack,
                });
            }
            return checkNeedRegister.participant;
        }
    } catch (error) {
        Logger.error({
            message: `${error}`,
            location: 'registerSelfDescription',
        });
    }
};
