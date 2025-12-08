import axios from 'axios';
import { urlChecker } from '../../utils/urlChecker';

export const consumerImport = async (
    endpoint: string,
    dataExchangeId: string,
    data: any,
    apiResponseRepresentation?: any,
    mimeType?: string
) => {
    if (!mimeType || mimeType === 'application/json') {
        return axios.post(
            urlChecker(endpoint, 'consumer/import'),
            {
                providerDataExchange: dataExchangeId,
                data,
                apiResponseRepresentation,
            },
            {
                headers: {
                    'x-provider-data-exchange': dataExchangeId,
                    'x-api-response-representation': apiResponseRepresentation,
                    'Content-Type': 'application/json',
                },
            }
        );
    } else {
        return axios.post(urlChecker(endpoint, 'consumer/import'), data, {
            headers: {
                'x-provider-data-exchange': dataExchangeId,
                'x-api-response-representation': apiResponseRepresentation,
                'content-Type': mimeType,
            },
            maxBodyLength: Infinity,
        });
    }
};
