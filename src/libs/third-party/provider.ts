import axios from 'axios';
import {urlChecker} from '../../utils/urlChecker';
import * as https from 'node:https';
import {checkConnectorProxy} from "./proxy";
import {getProxy} from "../loaders/configuration";

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
        (await checkConnectorProxy({
            dataExchangeId: consumerDataExchange,
            endpoint: providerEndpoint,
            configProxy: getProxy()
        })) ?? {httpsAgent: agent}
    );
};

export const providerImport = async (
    providerEndpoint: string,
    data: any,
    consumerDataExchange: string
) => {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    return axios.post(urlChecker(providerEndpoint, 'provider/import'), {
            data,
            consumerDataExchange,
        },
        (await checkConnectorProxy({
            dataExchangeId: consumerDataExchange,
            endpoint: providerEndpoint,
            configProxy: getProxy()
        })) ?? {httpsAgent: agent});
};

export const providerDSP = async (
    providerEndpoint: string,
    consumerDataExchange: string
) => {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    return axios.post(
        urlChecker(
            providerEndpoint,
            `provider/dsp`
        ),
        {
            consumerDataExchange,
        },
        {httpsAgent: agent}
    );
}
