import { Custom, PolicyStateFetcher } from 'json-odrl-manager';
import { Params } from './PolicyFetcher';
import axios from 'axios';
import { Logger } from '../libs/loggers';
import { getBillingUri } from '../libs/loaders/configuration';

const config = {
    billingUri: '',
};

export const readBillingUri = async () => {
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

type BillingRuleData = { rightOperand: { value: unknown } };
export class StateFetcher extends PolicyStateFetcher {
    constructor() {
        super();
    }
    @Custom()
    protected async getCompensate(): Promise<boolean> {
        // Bypass the 'compensate' ODRL action checker and hand control to the related duty.
        return true;
    }
}

// Billing data fetching functions
type BillingLimitDateData = { subscriptionId: string; limitDate: unknown };
const limitDate = async (
    payload?: Params,
    rule?: unknown
): Promise<{ data: object }> => {
    try {
        const { consumerID, resourceID } = payload;
        const billingUri = await readBillingUri();
        const url = `${billingUri}/subscriptions/validactive/limitdate/for/resource/${consumerID}/${resourceID}`;

        const response = await axios.get(url);
        if (response.status === 200) {
            const { data } = response;
            const billingDataSubs: BillingLimitDateData[] = data;
            const sub = billingDataSubs.find((sub: BillingLimitDateData) => {
                const limitDate: string = (rule as BillingRuleData).rightOperand
                    ?.value as string;
                const subLimiteDate: string = sub.limitDate as string;
                return (
                    !isNaN(Date.parse(limitDate)) &&
                    new Date(limitDate).getTime() >=
                        new Date(subLimiteDate).getTime()
                );
            });
            if (sub) {
                const { limitDate } = sub;
                return { data: { limitDate } };
            }
            return { data: { limitDate: 0 } };
        }
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
        return { data: {} };
    }
};

type BillingPayAmountData = { subscriptionId: string; payAmount: unknown };
const payAmount = async (
    payload?: Params,
    rule?: unknown
): Promise<{ data: object }> => {
    try {
        const { consumerID, resourceID } = payload;
        const billingUri = await readBillingUri();
        const url = `${billingUri}/subscriptions/validactive/pay/for/resource/${consumerID}/${resourceID}`;
        const response = await axios.get(url);

        if (response.status === 200) {
            const { data } = response;
            const billingDataSubs: BillingPayAmountData[] = data;
            const sub = billingDataSubs.find((sub: BillingPayAmountData) => {
                return (
                    !isNaN(+sub.payAmount) &&
                    +sub.payAmount >=
                        +(rule as BillingRuleData).rightOperand?.value
                );
            });
            if (sub) {
                const { payAmount } = sub;
                return { data: { payAmount } };
            }
            return { data: { payAmount: 0 } };
        }
    } catch (error) {
        Logger.error({
            location: error.stack,
            message: error.message,
        });
        return { data: {} };
    }
};

type BillingUsageCountData = { subscriptionId: string; usageCount: unknown };
const usageCountDecrease = async (subscriptionId: string): Promise<void> => {
    // Todo: call billing to decrease current subscription count
};
const usageCount = async (
    payload?: Params,
    rule?: unknown
): Promise<{ data: object }> => {
    try {
        const { consumerID, resourceID } = payload;
        const billingUri = await readBillingUri();
        const url = `${billingUri}/subscriptions/validactive/usage/for/resource/${consumerID}/${resourceID}`;

        const response = await axios.get(url);
        if (response.status === 200) {
            const { data } = response;
            const billingDataSubs: BillingUsageCountData[] = data;
            const sub = billingDataSubs.find((sub: BillingUsageCountData) => {
                return (
                    !isNaN(+sub.usageCount) &&
                    +sub.usageCount >=
                        +(rule as BillingRuleData).rightOperand?.value
                );
            });
            if (sub) {
                const { usageCount } = sub;
                await usageCountDecrease(sub.subscriptionId);
                return { data: { usageCount } };
            }
            return { data: { usageCount: 0 } };
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
