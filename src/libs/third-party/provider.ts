import axios from 'axios';
import { urlChecker } from '../../utils/urlChecker';
import * as https from 'node:https';

export const providerExport = async (
    providerEndpoint: string,
    consumerDataExchange: string,
    infrastructure?: boolean
) => {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    return axios.post(
        urlChecker(
            providerEndpoint,
            `provider/export${infrastructure ? '?infrastructure=true' : ''}`
        ),
        {
            consumerDataExchange,
        },
        { httpsAgent: agent }
    );
};

export const providerImport = async (
    providerEndpoint: string,
    data: any,
    consumerDataExchange: string
) => {
    return axios.post(urlChecker(providerEndpoint, 'provider/import'), {
        data,
        consumerDataExchange,
    });
};
