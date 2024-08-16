import { Custom, PolicyStateFetcher } from 'json-odrl-manager';
import { Params } from './PolicyFetcher';
import axios from 'axios';
import { Logger } from '../libs/loggers';
import { getBillingUri } from '../libs/loaders/configuration';

const config = {
    billingUri: '',
};

const readBillingUri = async () => {
    if (!config.billingUri) {
        config.billingUri = await getBillingUri();
    }
    return config.billingUri;
};

export enum BillingTypes {
    limitDate = 'limitDate',
    payAmount = 'payAmount',
    usageCount = 'usageCount',
}

export class StateFetcher extends PolicyStateFetcher {
    constructor() {
        super();
    }
    @Custom()
    protected async getCompensate(): Promise<boolean> {
        return true;
    }
}

// Billing data fetching functions
const limitDate = async (payload?: Params): Promise<{ data: object }> => {
    try {
        const { consumerID, resourceID } = payload;
        const billingUri = await readBillingUri();
        const url = `${billingUri}/subscriptions/limitdate/for/resource/${consumerID}/${resourceID}`;

        const response = await axios.get(url);
        if (response.status === 200) {
            const { data } = response;
            return { data };
        }
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
        return { data: {} };
    }
};

const payAmount = async (payload?: Params): Promise<{ data: object }> => {
    try {
        const { consumerID, resourceID } = payload;
        const billingUri = await readBillingUri();
        const url = `${billingUri}/subscriptions/pay/for/resource/${consumerID}/${resourceID}`;

        const response = await axios.get(url);
        if (response.status === 200) {
            const { data } = response;
            return { data };
        }
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
        return { data: {} };
    }
};

const usageCount = async (payload?: Params): Promise<{ data: object }> => {
    try {
        const { consumerID, resourceID } = payload;
        const billingUri = await readBillingUri();
        const url = `${billingUri}/subscriptions/usage/for/resource/${consumerID}/${resourceID}`;

        const response = await axios.get(url);
        if (response.status === 200) {
            const { data } = response;
            return { data };
        }
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
        return { data: {} };
    }
};

export default {
    limitDate,
    payAmount,
    usageCount,
};
