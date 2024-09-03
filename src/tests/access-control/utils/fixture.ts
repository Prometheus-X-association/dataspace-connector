import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export const consumerIds = {
    _a: 'consumerId_a',
};
export const consumerDataExchanges = {
    _a: `${consumerIds._a}_dataExchange_a`,
};
export const consumerEndpoints = {
    _a: `${consumerIds._a}_consumerEndpoint_a`,
};

type Contract = {
    rolesAndObligations: any[];
    status: 'pending';
    serviceOfferings: any[];
    purpose: any[];
    members: any[];
    revokedMembers: any[];
    createdAt: string;
    updatedAt: string;
};

type Bilateral = {
    status: string;
    createdAt: string;
    updatedAt: string;
    policy: any[];
};

export const bilateralUrls = {
    _a: ['http://localhost:8888/bilaterals/', '50726f6d6574686575732d58'],
};
export const mockBilateral = () => {
    const mock = new MockAdapter(axios);
    const date = new Date().toISOString();
    const bilateral: Bilateral = {
        status: 'signed',
        createdAt: date,
        updatedAt: date,
        policy: [
            {
                description: 'CAN use data without any restrictions',
                permission: [
                    {
                        action: 'use',
                        target: 'target_a', // 'http://target/target_a',
                        constraint: [],
                        duty: [
                            {
                                action: 'compensate',
                                constraint: [
                                    {
                                        leftOperand: 'payAmount',
                                        operator: 'eq',
                                        rightOperand: 100,
                                        unit: 'EUR',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                prohibition: [],
            },
        ],
    };

    mock.onGet(bilateralUrls._a.join('')).reply(200, {
        ...bilateral,
        _id: bilateralUrls._a[1],
    });

    mock.onPut(
        `${consumerEndpoints._a}/dataexchanges/${consumerDataExchanges._a}`
    ).reply((config) => {
        try {
            const data = JSON.parse(config.data);
            return [200, { data }];
        } catch (e) {
            return [500, {}];
        }
    });

    mock.onPut(/\/internal\/leftoperands\/count\/.*/).reply((config) => {
        console.log('Intercepted PUT request to URL:', config.url);
        return [200, {}];
    });

    mock.onAny().passThrough();
};

export const contractUrls = {
    _a: ['http://localhost:8888/contracts/', '50726f6d6574686575732d59'],
};
export const mockContract = () => {
    const mock = new MockAdapter(axios);
    const date = new Date().toISOString();
    const contract: Contract = {
        rolesAndObligations: [],
        status: 'pending',
        serviceOfferings: [],
        purpose: [],
        members: [],
        revokedMembers: [],
        createdAt: date,
        updatedAt: date,
    };

    mock.onGet(contractUrls._a.join('')).reply(200, {
        ...contract,
        _id: contractUrls._a[1],
    });

    mock.onAny().passThrough();
};
