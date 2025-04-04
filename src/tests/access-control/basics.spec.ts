import axios from 'axios';
import {
    FetcherConfig,
    PolicyFetcher,
} from '../../access-control/PolicyFetcher';
import { expect } from 'chai';
import app from './utils/serviceProviderInformer';
import {
    AccessRequest,
    PEP,
} from '../../access-control/PolicyEnforcementPoint';
import MockAdapter from 'axios-mock-adapter';
import dotenv from 'dotenv';
import { BillingTypes } from '../../access-control/Billing';

dotenv.config({ path: '.env.test' });
axios.defaults.baseURL = '';

const mock = new MockAdapter(axios);

/*
Example .env.test configuration:
SERVER_PORT=8003
REFERENCE_DATA_PATH=serviceOfferings.policies
REFERENCE_API_URL=http://127.0.0.1:8888
*/

const contractId = '659c027968c410b1f9ce4887';
const contract: any = {
    _id: contractId,
    rolesAndObligations: [],
    serviceChains: [],
    status: 'pending',
    serviceOfferings: [
        {
            participant: 'participantb',
            serviceOffering: 'offeringc',
            policies: [
                {
                    description: 'CAN use data without any restrictions',
                    permission: [
                        {
                            action: 'use',
                            target: 'http://service-offering-resource/',
                            constraint: [],
                            duty: [],
                        },
                    ],
                    prohibition: [],
                },
                {
                    description:
                        'MUST have been compensated with the specified payment amount in EUR before granting usage permission.',
                    permission: [
                        {
                            target: 'http://premium-service-offering-resource/',
                            action: 'use',
                            duty: [
                                {
                                    action: 'compensate',
                                    constraint: [
                                        {
                                            leftOperand: 'payAmount',
                                            operator: 'eq',
                                            rightOperand: 10,
                                            unit: 'EUR',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    purpose: [],
    members: [],
    revokedMembers: [],
    createdAt: '2024-08-12T14:41:12.767Z',
    updatedAt: '2024-08-12T14:44:22.563Z',
};

const SERVER_PORT = +process.env.SERVER_PORT;
const POLICY_FETCHER_CONFIG: FetcherConfig = Object.freeze({
    count: {
        url: `http://localhost:${SERVER_PORT}/data`,
        remoteValue: 'context.count',
    },
    language: {
        url: `http://localhost:${SERVER_PORT}/document/@{id}`,
        remoteValue: 'document.lang',
    },
});

const fetcher = new PolicyFetcher(POLICY_FETCHER_CONFIG);
PEP.showLog = true;

describe('Basic access control test cases', () => {
    before(async () => {
        await app.startServer(SERVER_PORT);
        mock.onGet(
            `${process.env.REFERENCE_API_URL}/contracts/${contractId}`
        ).reply(200, {
            ...contract,
            _id: contractId,
        });
        mock.onAny().passThrough();
    });
    after(async () => {
        mock.restore();
    });

    it('Should correctly extract policies from nested structure based on the specified path', async () => {
        const source = {
            contract: {
                offerings: [
                    {
                        policies: [{ name: 'policy1' }, { name: 'policy2' }],
                    },
                    {
                        policies: [{ name: 'policy3' }, { name: 'policy4' }],
                    },
                ],
            },
        };
        const path = 'contract.offerings.policies';
        const result = PEP.getTargetedPolicies(source, path);
        const expected = [
            { name: 'policy1' },
            { name: 'policy2' },
            { name: 'policy3' },
            { name: 'policy4' },
        ];
        expect(result).to.deep.equal(expected);
    });

    it("Should get a 'count' value from a service", async () => {
        const count = await fetcher.context.count();
        expect(count).to.be.equal(5);
    });

    it("Should get the 'language' value of a document delivered by a service", async () => {
        const SERVICE_RESOURCE_ID_A = 2;
        fetcher.setOptionalFetchingParams({
            language: { id: SERVICE_RESOURCE_ID_A },
        });
        const languageFr = await fetcher.context.language();
        expect(languageFr).to.be.equal('fr');

        const SERVICE_RESOURCE_ID_B = 0;
        fetcher.setOptionalFetchingParams({
            language: { id: SERVICE_RESOURCE_ID_B },
        });
        const languageEn = await fetcher.context.language();
        expect(languageEn).to.be.equal('en');
    });

    it('Should make a simple request through the PEP/PDP', async () => {
        const referenceURL = new URL(
            `contracts/${contractId}` || '',
            process.env.REFERENCE_API_URL
        ).toString();
        const request = new AccessRequest(
            'http://service-offering-resource/',
            referenceURL
        );
        request.setDataPath(process.env.REFERENCE_DATA_PATH);
        const success = await PEP.requestAction(request);
        expect(success).to.be.equal(true);
    });

    it('Should make a simple request through the PEP/PDP using service', async () => {
        const referenceURL = new URL(
            `contracts/${contractId}` || '',
            process.env.REFERENCE_API_URL
        ).toString();
        const request = new AccessRequest(
            'http://premium-service-offering-resource/',
            referenceURL
        );
        request.setDataPath(process.env.REFERENCE_DATA_PATH);
        request.addFetcherConfig(BillingTypes.payAmount, {
            payload: {
                participantID: 'participant_id',
                contractID: 'contract_id',
                resourceId: 'resource_id',
            },
            service: async (payload?: unknown): Promise<{ data: object }> => {
                return {
                    data: {
                        payAmount: 10,
                    },
                };
            },
            remoteValue: 'payAmount',
        });
        const success = await PEP.requestAction(request);
        expect(success).to.be.equal(true);
    });
});
