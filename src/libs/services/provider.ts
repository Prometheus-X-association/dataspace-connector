import axios from 'axios';
import { urlChecker } from '../../utils/urlChecker';

export const providerExport = async (
    providerEndpoint: string,
    consumerDataExchange: string
) => {
    return axios.post(urlChecker(providerEndpoint, 'provider/export'), {
        consumerDataExchange,
    });
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
