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
import dotenv from 'dotenv';
import { AppServer, startServer } from '../../server';
import { config, setupEnvironment } from '../../config/environment';
dotenv.config({ path: '.env.test' });

/*
a) Example .env.test configuration:

SERVER_PORT=8003
REFERENCE_DATA_PATH=serviceOfferings.policies
REFERENCE_ENDPOINT=contracts/659c027968c410b1f9ce4887
REFERENCE_API_URL=http://127.0.0.1:8888/

b) Test Instructions:

Ensure the following payload is injected:
    {
        "participant": "participantb",
        "serviceOffering": "offeringc",
        "policies": [
            {
                "ruleId": "rule-access-1",
                "values": {
                    "target": "http://service-offering-resource/"
                }
            }
        ]
    }

to the endpoint:
/contracts/policies/offering/{contractId}

after creating a contract with an empty payload:
    {
        "contract": {
        }
    }

on the endpoint:
/contract
*/

// axios.defaults.baseURL = '';

// const SERVER_PORT = +process.env.SERVER_PORT;
// const POLICY_FETCHER_CONFIG: FetcherConfig = Object.freeze({
//     count: {
//         url: `http://localhost:${SERVER_PORT}/data`,
//         remoteValue: 'context.count',
//     },
//     language: {
//         url: `http://localhost:${SERVER_PORT}/document/@{id}`,
//         remoteValue: 'document.lang',
//     },
// });

// const fetcher = new PolicyFetcher(POLICY_FETCHER_CONFIG);
// PEP.showLog = true;

// describe('Access control testing', () => {
//     let serverInstance: AppServer;
//     process.env.NODE_ENV = 'test';
//     const originalReadFileSync = require('fs').readFileSync;

//     before(async () => {
//         const file = {
//             "endpoint": "https://test.com",
//             "serviceKey": "789456123",
//             "secretKey": "789456123",
//             "catalogUri": "https://test.com",
//             "contractUri": "https://test.com",
//             "consentUri": "https://test.com",
//         }

//         require('fs').readFileSync = () => JSON.stringify(file);
//         setupEnvironment();
//         serverInstance = await startServer(config.port);
//     });

//     after(async () => {
//         require('fs').readFileSync = originalReadFileSync;
//         serverInstance.server.close();
//         console.log("Server closed");
//     });

//     it('Should correctly extract policies from nested structure based on the specified path', async () => {
//         const source = {
//             contract: {
//                 offerings: [
//                     {
//                         policies: [{ name: 'policy1' }, { name: 'policy2' }],
//                     },
//                     {
//                         policies: [{ name: 'policy3' }, { name: 'policy4' }],
//                     },
//                 ],
//             },
//         };
//         const path = 'contract.offerings.policies';
//         const result = PEP.getTargetedPolicies(source, path);
//         const expected = [
//             { name: 'policy1' },
//             { name: 'policy2' },
//             { name: 'policy3' },
//             { name: 'policy4' },
//         ];
//         expect(result).to.deep.equal(expected);
//     });

//     it("Should get a 'count' value from a service", async () => {
//         const count = await fetcher.context.count();
//         expect(count).to.be.equal(5);
//     });

//     it("Should get the 'language' value of a document delivered by a service", async () => {
//         const SERVICE_RESOURCE_ID_A = 2;
//         fetcher.setOptionalFetchingParams({
//             language: { id: SERVICE_RESOURCE_ID_A },
//         });
//         const languageFr = await fetcher.context.language();
//         expect(languageFr).to.be.equal('fr');

//         const SERVICE_RESOURCE_ID_B = 0;
//         fetcher.setOptionalFetchingParams({
//             language: { id: SERVICE_RESOURCE_ID_B },
//         });
//         const languageEn = await fetcher.context.language();
//         expect(languageEn).to.be.equal('en');
//     });

//     it('Should make a simple request through the PEP/PDP', async () => {
//         const referenceURL = new URL(
//             process.env.REFERENCE_ENDPOINT || '',
//             process.env.REFERENCE_API_URL
//         ).toString();
//         const request: AccessRequest = {
//             action: 'use',
//             targetResource: 'http://service-offering-resource/',
//             referenceURL,
//             referenceDataPath: process.env.REFERENCE_DATA_PATH,
//             fetcherConfig: {},
//         };
//         const success = await PEP.requestAction(request);
//         expect(success).to.be.equal(true);
//     });
// });
