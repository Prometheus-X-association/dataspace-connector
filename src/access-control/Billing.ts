import { Custom, PolicyStateFetcher } from 'json-odrl-manager';
import { Params } from './PolicyFetcher';

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

const limitDate = async (payload?: Params): Promise<{ data: object }> => {
    // TODO: Call the external billing component to retrieve the 'limitDate' subscription information.
    return { data: {} };
};

const payAmount = async (payload?: Params): Promise<{ data: object }> => {
    // TODO: Call the external billing component to retrieve the 'payAmount' subscription information.
    return { data: {} };
};

const usageCount = async (payload?: Params): Promise<{ data: object }> => {
    // TODO: Call the external billing component to retrieve the 'usageCount' subscription information.
    return { data: {} };
};

export default {
    limitDate,
    payAmount,
    usageCount,
};
