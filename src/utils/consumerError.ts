import axios from 'axios';
import { urlChecker } from './urlChecker';
import {checkConnectorProxy} from "../libs/third-party/proxy";
import {getProxy} from "../libs/loaders/configuration";

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
        },
        (await checkConnectorProxy({
            configProxy: getProxy()
        }))
    );

    throw Error(payload);
};
