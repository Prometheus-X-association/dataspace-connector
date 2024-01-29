import axios from 'axios';
import { urlChecker } from './urlChecker';

export const consumerError = async (
    consumerEndpoint: string,
    dataExchangeId: string,
    payload: string
) => {
    await axios.put(
        urlChecker(consumerEndpoint, `dataexchanges/${dataExchangeId}/error`),
        {
            origin: 'provider',
            payload: payload,
        }
    );

    throw Error(payload);
};
