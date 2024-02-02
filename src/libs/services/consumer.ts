import axios from 'axios';
import { urlChecker } from '../../utils/urlChecker';

export const consumerImport = async (
    endpoint: string,
    dataExchangeId: string,
    data: any
) => {
    return axios.post(urlChecker(endpoint, 'consumer/import'), {
        dataExchangeId: dataExchangeId,
        data,
    });
};

export const postConsumerData = async (
    endpoint: string,
    data: any,
    options?: any
) => {
    await axios.post(`${endpoint}`, data, options);
};

export const putConsumerData = async (
    endpoint: string,
    data: any,
    options?: any
) => {
    await axios.put(`${endpoint}`, data, options);
};
