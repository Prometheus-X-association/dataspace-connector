import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import jsonConfig from '../../../config.json';
import { IDataResource } from '../../../utils/types/dataResource';
import { IServiceOffering } from '../../../utils/types/serviceOffering';

export const consumerIds = {
    _a: 'consumerId_a',
};
export const consumerDataExchanges = {
    _a: `${consumerIds._a}_dataExchange_a`,
};
export const consumerEndpoints = {
    _a: jsonConfig.endpoint,
    // new URL(`${consumerIds._a}_consumerEndpoint_a`, jsonConfig.endpoint).href,
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
    _a: [
        `${new URL('bilaterals', jsonConfig.contractUri).href}/`,
        '50726f6d6574686575732d58',
    ],
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

    mock.onGet(bilateralUrls._a.join('')).reply((config) => {
        console.log('Intercepted GET request:', config.url);
        return [
            200,
            {
                ...bilateral,
                _id: bilateralUrls._a[1],
            },
        ];
    });

    mock.onPut(/\/internal\/leftoperands\/count\/.*/).reply((config) => {
        console.log('Intercepted PUT request:', config.url);
        return [200, {}];
    });

    mock.onAny().passThrough();
};

export const contractUrls = {
    _a: [
        `${new URL('contracts', jsonConfig.contractUri).href}/`,
        '50726f6d6574686575732d59',
    ],
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

    mock.onGet(contractUrls._a.join('')).reply((config) => {
        console.log(`Intercepted GET request: ${config.url}`);
        return [
            200,
            {
                ...contract,
                _id: contractUrls._a[1],
            },
        ];
    });

    mock.onAny().passThrough();
};

export const mockCatalog = (credential: string) => {
    const mock = new MockAdapter(axios);
    {
        const url = new URL('target_a_resource_a', jsonConfig.catalogUri).href;
        mock.onGet(url).reply((config) => {
            console.log(`Intercepted GET request: ${config.url}`);

            const dataResoure: IDataResource = {
                representation: {
                    type: 'REST',
                    url: new URL(
                        'target_a_serviceOffering_a',
                        jsonConfig.catalogUri
                    ).href,
                    method: 'apiKey',
                    credential,
                },
                apiResponseRepresentation: {
                    type: 'REST',
                    url: new URL(
                        'target_a_serviceOffering_b',
                        jsonConfig.catalogUri
                    ).href,
                    method: 'apiKey',
                    credential,
                },
            };
            return [200, dataResoure];
        });
    }
    {
        const url = new URL('target_a_serviceOffering_a', jsonConfig.catalogUri)
            .href;
        mock.onGet(url).reply((config) => {
            console.log(`Intercepted GET request: ${config.url}`);
            const serviceOffering: IServiceOffering = {
                name: 'serviceOffering_a',
                description: 'serviceOffering_a description',
            };
            return [200, serviceOffering];
        });
    }
    mock.onAny().passThrough();
};

export const mockEndpoint = (id: string) => {
    const mock = new MockAdapter(axios);
    {
        const url = new URL(`dataexchanges/${id}/error`, consumerEndpoints._a)
            .href;

        mock.onPut(url).reply((config) => {
            console.log(`Intercepted PUT request: ${config.url}`);
            return [200, {}];
        });

        mock.onPut(
            `${consumerEndpoints._a}/dataexchanges/${consumerDataExchanges._a}`
        ).reply((config) => {
            console.log('Intercepted PUT request:', config.url);
            try {
                const data = JSON.parse(config.data);
                return [200, { data }];
            } catch (e) {
                return [500, {}];
            }
        });
    }
    {
        const url = new URL('consumer/import', jsonConfig.endpoint).href;
        mock.onPost(url).reply((config) => {
            console.log('Intercepted POST request:', config.url);
            try {
                const data = JSON.parse(config.data);
                return [200, { data }];
            } catch (e) {
                return [500, {}];
            }
        });
    }
    mock.onAny().passThrough();
};
