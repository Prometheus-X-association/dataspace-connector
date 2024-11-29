const express = require('express');
const crypto = require('crypto');
const CryptoJS = require('crypto');
const axios = require('axios');
const app = express();

app.use(express.json());

// Middleware to log all HTTP requests
// Middleware to log all HTTP requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`); // Log the request method and URL
    next(); // Call the next middleware or route handler
});

app.get('/health', (req, res) => {
    res.send('OK');
});

app.get('/v1/consents/exchanges/provider', (req, res) => {
    res.status(200).json({
        participant: {
            selfDescription:
                'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
            base64SelfDescription:
                'aHR0cDovL2NhdGFsb2c6ODA4Mi92MS9jYXRhbG9nL3BhcnRpY2lwYW50cy82NmQxODcyNGVlNzFmOWYwOTZiYWU4MTA=',
        },
        exchanges: [
            {
                contracts: {
                    _id: '672c89942308b486f7d0bca1',
                    ecosystem: {
                        '@context': 'http://catalog:8082/v1/ecosystem',
                        '@type': 'Ecosystem',
                        _id: '672c8994870a096712ca4662',
                        administrator: '66d18a1dee71f9f096baec07',
                        orchestrator: '66d18a1dee71f9f096baec08',
                        name: 'CONSENT',
                        description: 'consent',
                        detailedDescription: '<p>consent</p>',
                        country_or_region: '',
                        target_audience: '',
                        main_functionalities_needed: [],
                        logo: 'ecosystem_default.jpg',
                        useCases: ['6477027612bef26b5efbc6b3'],
                        participants: [
                            {
                                organization: '66d18a1dee71f9f096baec07',
                                participant: '66d18a1dee71f9f096baec08',
                                roles: ['Orchestrator'],
                                _id: '672c8994870a096712ca4663',
                                offerings: [
                                    {
                                        serviceOffering:
                                            '672c8ae4870a096712ca56d7',
                                        policy: [
                                            {
                                                ruleId: 'rule-access-1',
                                                values: {
                                                    target: 'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                                                },
                                                _id: '672c8a49870a096712ca5046',
                                            },
                                        ],
                                        pricing: {
                                            pricingModel: [],
                                            pricingDescription: 'consent',
                                            pricing: '0',
                                            currency: 'EUR',
                                            billingPeriod: 'One shot',
                                            costPerAPICall: 0,
                                            setupFee: 0,
                                        },
                                        _id: '672c8a49870a096712ca5045',
                                    },
                                ],
                            },
                            {
                                organization: '66d18724ee71f9f096bae80f',
                                participant: '66d18724ee71f9f096bae810',
                                roles: [
                                    'http://localhost:3000/static/references/roles/serviceProviderForIndividuals.json',
                                    'http://localhost:3000/static/references/roles/serviceProviderForOrganisations.json',
                                ],
                                offerings: [
                                    {
                                        serviceOffering:
                                            '672c8ae4870a096712ca56d7',
                                        policy: [
                                            {
                                                ruleId: 'rule-access-1',
                                                values: {
                                                    target: 'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                                                },
                                                _id: '672c8b86870a096712ca6239',
                                            },
                                        ],
                                        pricing: {
                                            pricingModel: [],
                                            pricingDescription: '',
                                            pricing: '0',
                                            currency: '',
                                            billingPeriod: '',
                                            costPerAPICall: 0,
                                            setupFee: 0,
                                        },
                                        _id: '672c8b97870a096712ca658a',
                                    },
                                ],
                                _id: '672c8b97870a096712ca6586',
                            },
                            {
                                organization: '66d18724ee71f9f096bae80f',
                                participant: '66d18724ee71f9f096bae810',
                                roles: [
                                    'http://localhost:3000/static/references/roles/serviceProviderForIndividuals.json',
                                    'http://localhost:3000/static/references/roles/serviceProviderForOrganisations.json',
                                ],
                                offerings: [
                                    {
                                        serviceOffering:
                                            '672c89cb870a096712ca4d59',
                                        policy: [
                                            {
                                                ruleId: 'rule-access-1',
                                                values: {
                                                    target: 'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                                                },
                                                _id: '672c8b86870a096712ca6239',
                                            },
                                        ],
                                        pricing: {
                                            pricingModel: [],
                                            pricingDescription: '',
                                            pricing: '0',
                                            costPerAPICall: 0,
                                            setupFee: 0,
                                        },
                                        _id: '672c8bb3870a096712ca70c4',
                                    },
                                ],
                                _id: '672c8bb3870a096712ca70c3',
                            },
                        ],
                        searchedDatatypes: [],
                        searchedServices: [],
                        searchedDataCategories: ['hard skills'],
                        searchedServiceCategories: ['adaptive learning'],
                        searchedCategoriesDetails: [],
                        provides: [],
                        contract: '672c89942308b486f7d0bca1',
                        location: 'WORLD',
                        businessLogic: {
                            businessModel: [],
                            roles: [],
                        },
                        status: 'published',
                        schema_version: '1.1.0',
                        context: [],
                        joinRequests: [],
                        invitations: [
                            {
                                organization: '66d18724ee71f9f096bae80f',
                                participant: '66d18724ee71f9f096bae810',
                                roles: [
                                    'http://localhost:3000/static/references/roles/serviceProviderForIndividuals.json',
                                    'http://localhost:3000/static/references/roles/serviceProviderForOrganisations.json',
                                ],
                                status: 'Signed',
                                serviceOfferings: [''],
                                createdAt: '2024-11-07T09:42:30.309Z',
                                updatedAt: '2024-11-07T09:42:30.309Z',
                                _id: '672c8b86870a096712ca6235',
                                offerings: [
                                    {
                                        serviceOffering:
                                            '672c89cb870a096712ca4d59',
                                        policy: [
                                            {
                                                ruleId: 'rule-access-1',
                                                values: {
                                                    target: '672c89cb870a096712ca4d59',
                                                },
                                                _id: '672c8b86870a096712ca6239',
                                            },
                                        ],
                                        _id: '672c8b86870a096712ca6238',
                                    },
                                ],
                            },
                        ],
                        rolesAndObligations: [],
                        buildingBlocks: [
                            {
                                buildingBlock:
                                    'http://localhost:3000/static/references/building-block/contract.json',
                                implementation:
                                    'https://dataspace.prometheus-x.org/building-blocks/contract',
                                _id: '672c8995870a096712ca4765',
                            },
                            {
                                buildingBlock:
                                    'http://localhost:3000/static/references/building-block/identity.json',
                                implementation:
                                    'https://dataspace.prometheus-x.org/building-blocks/identity',
                                _id: '672c8995870a096712ca4766',
                            },
                            {
                                buildingBlock:
                                    'http://localhost:3000/static/references/building-block/catalog.json',
                                implementation:
                                    'https://dataspace.prometheus-x.org/building-blocks/catalog',
                                _id: '672c8995870a096712ca4767',
                            },
                        ],
                        createdAt: '2024-11-07T09:34:12.345Z',
                        updatedAt: '2024-11-07T09:43:15.861Z',
                        __v: 5,
                    },
                    orchestrator:
                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                    rolesAndObligations: [],
                    status: 'signed',
                    serviceOfferings: [
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                            policies: [
                                {
                                    description:
                                        'CAN use data without any restrictions',
                                    permission: [
                                        {
                                            action: 'use',
                                            target: 'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                                            duty: [],
                                            constraint: [],
                                        },
                                    ],
                                    prohibition: [],
                                },
                            ],
                            _id: '672c8a492308b486f7d0bcbd',
                        },
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                            policies: [
                                {
                                    description:
                                        'CAN use data without any restrictions',
                                    permission: [
                                        {
                                            action: 'use',
                                            target: 'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                                            duty: [],
                                            constraint: [],
                                        },
                                    ],
                                    prohibition: [],
                                },
                            ],
                            _id: '672c8b972308b486f7d0bce5',
                        },
                    ],
                    dataProcessings: [
                        {
                            catalogId: '670e8eb6b439a2379f290fc1',
                            infrastructureServices: [
                                {
                                    participant:
                                        'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                                    serviceOffering:
                                        'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                                },
                                {
                                    participant:
                                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                                    serviceOffering:
                                        'http://catalog:8082/v1/catalog/serviceofferings/672c8e77870a096712ca7676',
                                },
                                {
                                    participant:
                                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                                    serviceOffering:
                                        'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                                },
                            ],
                        },
                        {
                            catalogId: '670e8eb6b439a2379f290fc2',
                            infrastructureServices: [
                                {
                                    participant:
                                        'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                                    serviceOffering:
                                        'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                                },
                                {
                                    participant:
                                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                                    serviceOffering:
                                        'http://catalog:8082/v1/catalog/serviceofferings/672c8dbf870a096712ca74fd',
                                },
                                {
                                    participant:
                                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                                    serviceOffering:
                                        'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                                },
                            ],
                        },
                    ],
                    purpose: [],
                    members: [
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                            role: 'orchestrator',
                            signature: 'signed',
                            date: '2024-11-07T09:43:07.803Z',
                        },
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                            role: 'participant',
                            signature: 'signed',
                            date: '2024-11-07T09:43:15.850Z',
                        },
                    ],
                    revokedMembers: [],
                    createdAt: '2024-11-07T09:34:12.653Z',
                    updatedAt: '2024-11-07T09:43:15.848Z',
                    __v: 3,
                },
                contract:
                    'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
                consumer: {
                    '@context': 'http://catalog:8082/v1/participant',
                    '@type': 'Participant',
                    _id: '66d18a1dee71f9f096baec08',
                    did: null,
                    legalName: 'ParticipantOne',
                    legalPerson: {
                        registrationNumber: '',
                        headquartersAddress: {
                            countryCode: '',
                        },
                        legalAddress: {
                            countryCode: '',
                        },
                        parentOrganization: [],
                        subOrganization: [],
                    },
                    termsAndConditions: '',
                    associatedOrganisation: '66d18a1dee71f9f096baec07',
                    schema_version: '1',
                    dataspaceConnectorAppKey:
                        '819f186b8bcd53064adfe60e4455708fb07ea4eff463b126cd36e13d0f3fd53c6a8c5ec2890bbcfd7c0ee448ba08804ddb5e0f439de8eb2e7a4abfb5eb703925',
                    dataspaceEndpoint: 'http://consumer:3001/',
                    logo: '/images/1726690974588-logo-bicolore.png',
                    permissions: [],
                    plan: {
                        subscriptions: [
                            '66e825f76d6b9fb771dab7b1',
                            '66e834481d7c9626e9c8e5ca',
                            '66eae9197e18a564942c7599',
                        ],
                        paymentMethods: ['66e83573d9037128af305196'],
                        stripeId: 'cus_QkwZcvSxEtgAvW',
                    },
                    createdAt: '2024-08-30T09:00:13.791Z',
                    updatedAt: '2024-10-21T14:20:22.142Z',
                    __v: 0,
                },
                base64Contract:
                    'aHR0cDovL2NvbnRyYWN0OjgwODEvY29udHJhY3RzLzY3MmM4OTk0MjMwOGI0ODZmN2QwYmNhMQ==',
                participantSelfDescription:
                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                base64SelfDescription:
                    'aHR0cDovL2NhdGFsb2c6ODA4Mi92MS9jYXRhbG9nL3BhcnRpY2lwYW50cy82NmQxOGExZGVlNzFmOWYwOTZiYWVjMDg=',
            },
        ],
    });
});

app.get('/v1/consents/privacy-notices/6734ce6eb36f3b579c928548', (req, res) => {
    res.status(200).json({
        _id: '6734ce6eb36f3b579c928548',
        contract: {
            _id: '672c89942308b486f7d0bca1',
            ecosystem:
                'http://catalog:8082/v1/catalog/ecosystems/672c8994870a096712ca4662',
            orchestrator:
                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
            rolesAndObligations: [],
            status: 'signed',
            serviceOfferings: [
                {
                    participant:
                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                    serviceOffering:
                        'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                    policies: [
                        {
                            description:
                                'CAN use data without any restrictions',
                            permission: [
                                {
                                    action: 'use',
                                    target: 'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                                    duty: [],
                                    constraint: [],
                                },
                            ],
                            prohibition: [],
                        },
                    ],
                    _id: '672c8a492308b486f7d0bcbd',
                },
                {
                    participant:
                        'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                    serviceOffering:
                        'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                    policies: [
                        {
                            description:
                                'CAN use data without any restrictions',
                            permission: [
                                {
                                    action: 'use',
                                    target: 'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                                    duty: [],
                                    constraint: [],
                                },
                            ],
                            prohibition: [],
                        },
                    ],
                    _id: '672c8b972308b486f7d0bce5',
                },
            ],
            dataProcessings: [
                {
                    catalogId: '670e8eb6b439a2379f290fc1',
                    infrastructureServices: [
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                        },
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c8e77870a096712ca7676',
                        },
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                        },
                    ],
                },
                {
                    catalogId: '670e8eb6b439a2379f290fc2',
                    infrastructureServices: [
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                        },
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c8dbf870a096712ca74fd',
                        },
                        {
                            participant:
                                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                            serviceOffering:
                                'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                        },
                    ],
                },
            ],
            purpose: [],
            members: [
                {
                    participant:
                        'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                    role: 'orchestrator',
                    signature: 'signed',
                    date: '2024-11-07T09:43:07.803Z',
                },
                {
                    participant:
                        'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                    role: 'participant',
                    signature: 'signed',
                    date: '2024-11-07T09:43:15.850Z',
                },
            ],
            revokedMembers: [],
            createdAt: '2024-11-07T09:34:12.653Z',
            updatedAt: '2024-11-07T09:43:15.848Z',
            __v: 3,
        },
        lastUpdated: '1731513966730',
        dataProvider: {
            '@context': 'http://catalog:8082/v1/participant',
            '@type': 'Participant',
            _id: '66d18724ee71f9f096bae810',
            did: null,
            legalName: 'Test-DataProvider',
            legalPerson: {
                registrationNumber: '',
                headquartersAddress: {
                    countryCode: '',
                },
                legalAddress: {
                    countryCode: '',
                },
                parentOrganization: [],
                subOrganization: [],
            },
            termsAndConditions: '',
            associatedOrganisation: '66d18724ee71f9f096bae80f',
            schema_version: '1',
            dataspaceConnectorAppKey:
                '4c0fd27c0f59359087abb708eb453377bc19140999de1365a979507986f87f93c7dacb362d65944b4f134b2a341e998f2a63ab884dd0c83b469d0c69a90ecf18',
            dataspaceEndpoint: 'http://host.docker.internal:3333/',
            logo: '',
            permissions: [],
            plan: {
                subscriptions: ['66eae95e7e18a564942c796f'],
                paymentMethods: [],
                stripeId: 'cus_QkwN2TiLBX65LT',
            },
            createdAt: '2024-08-30T08:47:32.824Z',
            updatedAt: '2024-09-18T14:53:19.348Z',
            __v: 0,
        },
        dataProcessings: [
            {
                catalogId: '670e8eb6b439a2379f290fc1',
                infrastructureServices: [
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                    },
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8e77870a096712ca7676',
                    },
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                    },
                ],
            },
            {
                catalogId: '670e8eb6b439a2379f290fc2',
                infrastructureServices: [
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                    },
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8dbf870a096712ca74fd',
                    },
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                    },
                ],
            },
        ],
        controllerDetails: {
            name: 'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
            contact: '',
            representative: '',
            dpo: {
                name: '',
                contact: '',
            },
        },
        purposes: [
            {
                '@context': 'http://catalog:8082/v1/softwareresource',
                '@type': 'SoftwareResource',
                _id: '672c8acc870a096712ca565d',
                providedBy: '66d18a1dee71f9f096baec08',
                name: 'consumer consent data',
                description: 'consumer consent data',
                aggregationOf: [],
                copyrightOwnedBy: ['unused_information'],
                license: [],
                policy: [],
                category: '637cf6ad21a33e9bccaf58b4',
                locationAddress: [
                    {
                        countryCode: 'WORLD',
                        _id: '672c8acc870a096712ca565e',
                    },
                ],
                users_clients: 0,
                demo_link: '',
                relevant_project_link: '',
                schema_version: '1.1.0',
                usePII: true,
                isAPI: false,
                b2cDescription: [],
                jurisdiction: '',
                retention_period: '',
                recipient_third_parties: [],
                createdAt: '2024-11-07T09:39:24.121Z',
                updatedAt: '2024-11-07T09:39:24.176Z',
                __v: 0,
                representation: {
                    _id: '672c8acc870a096712ca5668',
                    resourceID: '672c8acc870a096712ca565d',
                    type: 'REST',
                    url: 'http://consumer-api:8031/users/{userId}',
                    method: 'none',
                    credential: '',
                    queryParams: [],
                    createdAt: '2024-11-07T09:39:24.182Z',
                    updatedAt: '2024-11-07T09:39:24.182Z',
                    __v: 0,
                },
                resource:
                    'http://catalog:8082/v1/catalog/softwareresources/672c8acc870a096712ca565d',
            },
        ],
        categoriesOfData: [],
        data: [
            {
                '@context': 'http://catalog:8082/v1/dataresource',
                '@type': 'DataResource',
                _id: '672c8a28870a096712ca4e63',
                aggregationOf: [],
                name: 'consent data',
                description: 'consent data',
                copyrightOwnedBy: [],
                license: [],
                policy: [],
                producedBy: '66d18724ee71f9f096bae810',
                exposedThrough: [],
                obsoleteDateTime: '',
                expirationDateTime: '',
                containsPII: true,
                anonymized_extract: '',
                archived: false,
                attributes: [],
                category: '6090ff950d9b6451c24ac0b0',
                isPayloadForAPI: false,
                country_or_region: 'WORLD',
                entries: 0,
                subCategories: [],
                schema_version: '1',
                b2cDescription: [],
                createdAt: '2024-11-07T09:36:40.059Z',
                updatedAt: '2024-11-07T09:36:40.110Z',
                __v: 0,
                representation: {
                    _id: '672c8a28870a096712ca4e6d',
                    resourceID: '672c8a28870a096712ca4e63',
                    fileType: '',
                    type: 'REST',
                    url: 'http://provider-api:8011/users/{userId}',
                    sqlQuery: '',
                    className: '',
                    method: 'none',
                    credential: '',
                    queryParams: [],
                    createdAt: '2024-11-07T09:36:40.117Z',
                    updatedAt: '2024-11-07T09:36:40.117Z',
                    __v: 0,
                },
                resource:
                    'http://catalog:8082/v1/catalog/dataresources/672c8a28870a096712ca4e63',
            },
        ],
        recipients: [
            {
                '@context': 'http://catalog:8082/v1/participant',
                '@type': 'Participant',
                _id: '66d18a1dee71f9f096baec08',
                did: null,
                legalName: 'ParticipantOne',
                legalPerson: {
                    registrationNumber: '',
                    headquartersAddress: {
                        countryCode: '',
                    },
                    legalAddress: {
                        countryCode: '',
                    },
                    parentOrganization: [],
                    subOrganization: [],
                },
                termsAndConditions: '',
                associatedOrganisation: '66d18a1dee71f9f096baec07',
                schema_version: '1',
                dataspaceConnectorAppKey:
                    '819f186b8bcd53064adfe60e4455708fb07ea4eff463b126cd36e13d0f3fd53c6a8c5ec2890bbcfd7c0ee448ba08804ddb5e0f439de8eb2e7a4abfb5eb703925',
                dataspaceEndpoint: 'http://host.docker.internal:3334/',
                logo: '/images/1726690974588-logo-bicolore.png',
                permissions: [],
                plan: {
                    subscriptions: [
                        '66e825f76d6b9fb771dab7b1',
                        '66e834481d7c9626e9c8e5ca',
                        '66eae9197e18a564942c7599',
                    ],
                    paymentMethods: ['66e83573d9037128af305196'],
                    stripeId: 'cus_QkwZcvSxEtgAvW',
                },
                createdAt: '2024-08-30T09:00:13.791Z',
                updatedAt: '2024-10-21T14:20:22.142Z',
                __v: 0,
            },
        ],
        internationalTransfers: {
            countries: [],
            safeguards: '',
        },
        retentionPeriod: '',
        piiPrincipalRights: [],
        withdrawalOfConsent: '',
        complaintRights: '',
        provisionRequirements: '',
        automatedDecisionMaking: {
            details: '',
        },
        schema_version: '0.1.0',
        createdAt: '2024-11-13T16:06:06.780Z',
        updatedAt: '2024-11-13T16:06:06.780Z',
        __v: 0,
        consumerEmail: false,
    });
});

app.get(
    '/v1/consents/664f48fdc37cba87ff047f8b/aHR0cDovL2NhdGFsb2c6ODA4Mi92MS9jYXRhbG9nL3BhcnRpY2lwYW50cy82NmQxODcyNGVlNzFmOWYwOTZiYWU4MTA=/aHR0cDovL2NhdGFsb2c6ODA4Mi92MS9jYXRhbG9nL3BhcnRpY2lwYW50cy82NmQxOGExZGVlNzFmOWYwOTZiYWVjMDg=',
    (req, res) => {
        res.status(200).json([
            {
                _id: '6734ce6eb36f3b579c928548',
                contract:
                    'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
                lastUpdated: '1731513966730',
                dataProvider:
                    'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                dataProcessings: [
                    {
                        catalogId: '670e8eb6b439a2379f290fc1',
                        infrastructureServices: [
                            {
                                participant:
                                    'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                                serviceOffering:
                                    'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                            },
                            {
                                participant:
                                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                                serviceOffering:
                                    'http://catalog:8082/v1/catalog/serviceofferings/672c8e77870a096712ca7676',
                            },
                            {
                                participant:
                                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                                serviceOffering:
                                    'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                            },
                        ],
                    },
                    {
                        catalogId: '670e8eb6b439a2379f290fc2',
                        infrastructureServices: [
                            {
                                participant:
                                    'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                                serviceOffering:
                                    'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                            },
                            {
                                participant:
                                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                                serviceOffering:
                                    'http://catalog:8082/v1/catalog/serviceofferings/672c8dbf870a096712ca74fd',
                            },
                            {
                                participant:
                                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                                serviceOffering:
                                    'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                            },
                        ],
                    },
                ],
                controllerDetails: {
                    name: 'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                    contact: '',
                    representative: '',
                    dpo: {
                        name: '',
                        contact: '',
                    },
                },
                purposes: [
                    {
                        purpose: 'consumer consent data',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                        resource:
                            'http://catalog:8082/v1/catalog/softwareresources/672c8acc870a096712ca565d',
                    },
                ],
                categoriesOfData: [],
                data: [
                    {
                        resource:
                            'http://catalog:8082/v1/catalog/dataresources/672c8a28870a096712ca4e63',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                    },
                ],
                recipients: [
                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                ],
                internationalTransfers: {
                    countries: [],
                    safeguards: '',
                },
                retentionPeriod: '',
                piiPrincipalRights: [],
                withdrawalOfConsent: '',
                complaintRights: '',
                provisionRequirements: '',
                automatedDecisionMaking: {
                    details: '',
                },
                schema_version: '0.1.0',
                createdAt: '2024-11-13T16:06:06.780Z',
                updatedAt: '2024-11-13T16:06:06.780Z',
                __v: 0,
            },
        ]);
    }
);

app.post('/v1/consents', async (req, res) => {
    const { triggerDataExchange } = req.query;
    if (
        triggerDataExchange === 'true' &&
        req.body &&
        req.body.privacyNoticeId === '6734ce6eb36f3b579c928548' &&
        req.body.userId === '65646d4320ec42ff2e719706' &&
        req.body.dataProcessingId === '670e8eb6b439a2379f290fc1'
    ) {
        const payload = {
            signedConsent:
                '7ef3efb9af30b2c3d4f91851492be5ae:7b5e5acc231050729945c3df7022efbde2cefdcf1e07128a342cc91b3c8cdadae1b3a2a9b7900680328dbe2dcd2a1865156ca8760077a9e32be39bc89e10e8c51886fc99b2c4a2719536b8b0e93c7ce1a25ab0937840ac4dab1a24b814895ed80f93e397b3e18d577694a52837857b9edbf6d0ec23c5537e20e1a34a4da4bc99377fdb6708351e0d6eea4410fa23419eb4f947e3c54bcbf4095602442f41b08c5dd29690b39141c1d4fe7e868a3566388b772f34adb2632f28a9177dfc31107cd5520463fbf90825438133eac1c1f8c7db714eac3748c9bea40e7f4ad2e6f472c7cdcacf6b33598357fcec20fd9b31b436edc78dc53b7546ed18f0db8ff32d322498bea9290d0c2ddef44bed4bbfa8fedc256137124b2557995b47489a76aec6fa75fe710ef9c8bd26ab890438d504bf897e7a66edfcf661dec3c41c433699455b37fa748e9397c5c73a34bdd549230715d353921085fe59b0e16febd0aed375e23884e4436caa7fad9da62b39e6ef6e987406dd3fd210553ed9bebc65195ee733b0ea2b8f8f8d309d352ca384a9242b0a87173023af29defab4b3c3bd7fbf096528a9858f1186717a962bc0ddced9f0b2441f0f98052a4153e89f04def71cd43134b7e64bc6bff09c9ec5272bd31976ebb1ac44859d283caa4d4ae34aaf2f73e3713f747467f0a556eee732116fc75d20de71e9e86716b0c330e022c29ea9cb4944561a621352a5a9c184dbee68eb5b0ced077f6205730b8e9971e7c947d4d6f7cacda54509b697287cc0e9a047aa6ae1069135617917266ad5c0fe79da622c10658fa000b7e073759067d1e80fda94631dcd0e9d8f4dfb4c98b9230aea02e3446eb1d4c374b3d8a9693068f62090553c95915f99736e9d73bf82fa3efa0bceeab8222f9de3e4c2853909d86538e0fa83bbd3cf552743e2e337998ae2e03d7cc2b66f7a8602fd3fcc3d25ad4c5370fd5afdb343120bdc91f774bf0f8baadcc5e4ccd5995d920a35387efb5b6cf42a4c1c737916d09fbcc8c83f0f745e5ad25ca45591a8b681453db8a98c1d7bfbb87ae619daef7ac22075a18ed9e8de3b5057ace46f604dcb7c80c20446a5a7f5a580cfd25732b307a112919c0485b5270304f872dffcc7e70c40af5643f22902de5370f0c1574bf58811c6c07869272b502f3f5cabbebbceac5c61719ed29c4580d0f203dc32253b217c8fafe96a23f4efed14903c49b8c17737e8ac38301610bf9b8cb8565c206297c1fa3b8c1e8fa5b41430eee38c4a0634ae8f29aae31c144e1a47470aadabe90ad7ff1f06e973438533f53ed2f0e773dad1b41ece713871eae0131f1b44f1ce93d423695ed057661b50e1801cddedd24d4077c8aa84c81ea7862abcfb4b1927fa9b58abf71ae23ff70209901743c3e2b4a70d3fb0ee6ae5011409eef60710f675837a229873dd5331ea9124e08ca350e27ee2cecf89865de318dd09b20cd65833d349e1f7ab96c396ed480f57090eced4a6301f68b388e14d1fe93ffb3b08bc39f7fcb95adfb09858b505f1135390bdaeeaec23e8d803ed3b887a8e48070699f8fb493513f8c569a63bea41ed93ba7d92d9e6911e62eb8e5a2c7031900c741420dd80e4808a94fa350ae30a464bbef38fd1fbfc938b93814a591cdeb480aefb3e8df6ca015cc174c7668bfc79811947849c45ec72428a5f393353649815e1b175e6c50238d24166a241c9ba62c3a210716fe6c90612b37f5af3378905993931695f9b5948ac61ea8f57f6574ef31be6f304363a3985d52a4aa26932806efa1e211f9bc2d46401a72736bff83895c01b5b84a9b31868545c35caa5f9350b852492a111a0b66d80159601e574cfcc4b0d8650f55466dc9a8be7c1d921a2122f07e99248a9d7c952d74b090825bd4c208bbc6b98df415087cb4fe9e0baf40e0cd41056d6195946db5a9254296927fdc2cd581037f416dd68695e95cd8a98f268ff05681b377e9fd5ec1d80bfbedaccd01effcf16ae8a58c29603baae801d77cc2e21c5bf20419b15ebd60fdaeadd0025f39aa763a43fe2c115050a5e13a86a8def039265024212077aae7dac88fcd69c15fbc26059ba2886c93d03e3e3985f7de97f82a555e14c95399ff6e014180e2769294d531bd469dd770bceaf9c55f3b2091e51bdb726587252ac31dfafeec8e77d2b1344f02ebd2d86d7058c404d537c22c6f1e584b4236e37e64f3075d7a77b35e66c0e7415f46df2e5d0db5c5f630b31d9727a55ad6b17eb3ed5e51dde76925c78e1346cba8002bf0abe18d5dc9bd69b4a057d416ef9c6c10965f021e4a1164b7b0b029666b825d465027c8a068059475e6aa1c0fae03c61bfc90e7cbc0be81a209423dd57b70c9c7db8b657758d712dd6bbe4b7ac69c05eb7e50fb7da64f80e4710f369078c46faa18cb70ff3873aff7e02a1590b178dd0cdf78cd509dd0a7cabc209b6d1581b72084edebb9f712cfdd4f2a1dc9ff5d247d554cad203bba3f0019a0ed1bc4ee29633aa452813094974139d80d533579a0a38ee9d51e50812ad7b4570e2b55235f6eddd33e7f47343dd8bd68bd8c8c2b6c65d28c65dec80555568da1f14c6963b59e4650dbe26677abd271026aedff07228b8080c65aa241234b7c57792c9a82d118a3571ffe6f066cbce37fa1712db8843151beba83b5b29577d34d393d2c91ff5de2f3516c95800882b17495f0bd0dea9bbbde31e8d7905f399d1ada73c3bcc1a07d8a2a45a5137c3a94f24dd9f4c1bed91d53b0b7f16ecb2487eb6a0d216979667c75b4f61ada55adceb2f7f7ea7d1aa4ed493aac3b7ebc52752e2c15d823035ffa1db661e067a59a2b41144b2a609171a147ff90d3a08ac5f97212148ad06033778cc01c1c6909264900efbe8a2634331689190a6bffba55b92898adbebb7c9d7688609343c6aa2238a6d1fa023e1fc5d0920982a8178d43bd9a6a12460b60b862207c2213f699670ac90c123220848c10517f6fabacbf7178ddba37d3deb9999d33dd94affdd767644d2d492a294fac898d4c8ff8e00f8a41a6450abd8b34cd872744ca9de2abcd9ae441ec89fa11bf71eb3d02b3161029efe5a95c7195bfc0da920c35494e4e43693aa98fecfeafd6a0b7f3de1fcdb6b28271389763313bd79aff0753d2b070b22431c8a7a9f2ad5d48bae578559ec71cedd82e3234940bcb5f0b6b41e9604ac0f4a22250da63f347dc79f48a0d4badab3a01f4774244bc4174bc8aa802ab13597c2b7487da0e61095b5f2e891c49e9e15fa91d12296e900f1d24d462af64ba9f7df7ee45375430a989dbdd1ff9cc9c4fffa57fe63a71874bd9fe0a848c8424337077316627ca0e271339e40a468d29171380d868dc8878633eb20bfe6f5a8a6763a9c61337c773dc94beca3e5cf5951cb8544bf8eef6227de275ade4f8a526c58e77a139b7a427184665550f6af856300354c4c736c03273c2eacf14150584c44af3f220077cfc05efec4c3347089f4c40b738abef2b6a40424f6b9d7e2462d304f44d9c3c87b9d08a1243839ef0264a58ed9134a48afe1db42efde4f4e6006847a3a010421340937c34e2b0363bea496dc4ec0aae382434dc374fe81b1f630cee828a22f79d9136f29e0112049f8bb2cb82cb9d39b6cb72c256809e6423ceedd5727a0c28a3b50ee5a2c10cb26ef0d66242b16f404cc2eeaa510149540d5b63353c8ae1f2057a76c9295395d42ce5920ed760cad16958310bbb5ece61d4b42b4bb4d8929178b8262134fea0b701f26afac2bdaef933f321b67cbea048b941d91ff204001ffd04877c4c53d8cb4ce01ffcdc05e4f1277617a91f1f71310c523cd367018f136a9b076e512064b871d503e71af3c0426a33f75ab170a2ec61470fc6b89e541afad4bea019fe0cd52fed1d0a0407434fec505644332911acbe74748a59170263993bf10e4dbf22318e7247d412fe7ac85a5ab5b798fe275ffc39fb8828d55be525ba85f7b88da9fcbd9a67223bcb3a7435459126b5b385547b03419db07cb287302e8235d8c1f4b2c7e4b0266db4e43ba7e7a04553e5df3dc75547041f72163e75c5e717aae457c541043c0ac573cdfed04d1f029ab01506ea961b13db27f653ab767535e8c1326aeb0326b15ac2ad1d6f46c202a957e098a1f8570a7282fc091b4157b9025cbf371d3d9bafd9107badea95f3427a04baed470945b8d8c4f7183a80ed120253db3d34687e9d02033c9edbc37cea67713352c898df15a497b46bc99e29c646ead5176ececeb75d28e1616fb209109740c3d74620f17f8f190fedbf9f379235c05b1fe4d37e3bf9b22600f4abb13defccfbdc5c1c6de995e282f2ebdb3a87eeaef35374714f4213b3ce51f3f19fe189141d023584fd4850325c4b888710c9f757007d5d76affa71c13c27d6170bbccb565b0e04da4b3e3bee307fa085afdc183a86db660c7ac65e0ac587448fa071e07772de78ccb9cdbfa94aa5bc4e9d2d8323e1653d1a9a33e1c7734c8fbd8ed0fd1fa9a65966ac9a3f5cc30c0e24a7c03260a23a7e7c77e4c79f961dbbe9890c5dbf3334a8ee6a47ffc895cf6a775a5a87f58f64b156e095734a51c4a4597cf5bb0fc3f66a8e1d9fae5563d13610f367d6a199927e6df5a35533a6534f75dbb4eb4c77df6a802bd991fdce32c80cef98782c66e7505d0e94cde5d276eff5165477af40f3439ae4d48f2efabc35a122365ff22b723eedf991dcffd9b5c1994969a978f7f310c57db2d43a63424eb77c0ee14628425583dc8afcb0c687a9a0a215297b0488a8eba9368f5606854f22f50af66c64085775048cd4d9320fae959250e38db62f4769b3a5d66b16bd63b5f9713b30bc80c3a08f0535b2e51db537bd97fc8a4d0db83027d38ddc9f284334acb7a9557df78cf29c74f0c10729708949a50ee93b42dcc317e18342f1cc4ae82a4519fba109361c58013f1f47fab0a6caae6588a6d4b4429036182922cb5b9fea290a91929e838bf0ec0a5e1a791b14b904e91257ee41df28df8de05e6bc65f4860c81ee0231cad9ece9608af1ead23fa1d4aa5317d4763651f8195e1736e2c42f19d6cff1b02a13f788762621935e66d75bb12dddcc67abbfa82604d62e0511f1be5a30b4187b867f61f3d9ea0b4d828be0f277c08dfae39cab43dad4f5eae680ce8d07785a978c592c3ce311ad27184d67635ac3db93d10b10bdce812ebfc82ad261ba73832dff8d1a5dabc5b07a60ee48',
            encrypted: {
                type: 'Buffer',
                data: [
                    110, 251, 235, 23, 253, 103, 125, 89, 236, 186, 253, 152,
                    65, 119, 167, 120, 183, 189, 176, 4, 167, 191, 130, 186,
                    135, 213, 254, 216, 179, 147, 205, 187, 203, 51, 205, 159,
                    217, 6, 35, 31, 117, 61, 180, 8, 116, 113, 109, 151, 175,
                    23, 93, 209, 80, 59, 80, 82, 108, 169, 165, 66, 117, 174,
                    68, 190, 89, 71, 247, 173, 175, 67, 85, 204, 163, 134, 47,
                    244, 204, 232, 143, 123, 210, 242, 128, 159, 75, 18, 33,
                    239, 115, 168, 165, 156, 47, 61, 58, 192, 106, 89, 136, 247,
                    236, 162, 69, 210, 200, 150, 125, 144, 237, 122, 163, 188,
                    137, 57, 115, 45, 18, 81, 148, 187, 187, 200, 246, 131, 185,
                    29, 3, 142, 139, 113, 70, 142, 143, 242, 118, 157, 10, 22,
                    131, 234, 104, 50, 215, 202, 129, 87, 231, 96, 88, 100, 168,
                    73, 150, 125, 104, 14, 249, 218, 251, 80, 238, 27, 154, 196,
                    216, 227, 71, 159, 81, 39, 15, 158, 29, 97, 8, 72, 157, 36,
                    42, 157, 1, 118, 116, 90, 52, 250, 183, 134, 30, 42, 192,
                    194, 165, 115, 133, 4, 253, 197, 128, 123, 168, 156, 95, 9,
                    145, 188, 175, 53, 7, 29, 180, 157, 41, 48, 37, 167, 212,
                    15, 94, 67, 227, 11, 217, 100, 158, 51, 93, 2, 113, 100,
                    255, 163, 119, 184, 49, 246, 166, 200, 166, 161, 139, 255,
                    101, 82, 164, 143, 107, 35, 158, 21, 21, 32, 255, 173, 79,
                    122,
                ],
            },
        };

        await axios.post('http://provider:3000/consent/export', payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        return res.status(200).json({
            message:
                "Successfully sent consent to the provider's consent export endpoint to trigger the data exchange",
            consentReceipt: {
                record: {
                    schemaVersion: '0.2.0',
                    recordId: '67351e16038969dfa74a662e',
                    piiPrincipalId: '660fff4528678b2683bab15f',
                },
                piiProcessing: {
                    privacyNotice: '6734ce6eb36f3b579c928548',
                    language: 'en',
                    purposes: [
                        {
                            purpose: 'consumer consent data',
                            lawfulBasis: 'consent',
                            piiInformation: [],
                            piiControllers: [
                                'http://host.docker.internal:4040/v1/catalog/participants/66d18724ee71f9f096bae810',
                                'http://host.docker.internal:4040/v1/catalog/participants/66d18a1dee71f9f096baec08',
                            ],
                            collectionMethod: [],
                            processingMethod: [],
                            storageLocation: [],
                            processingLocations: [],
                            geographicRestrictions: [],
                            services: [],
                            withdrawalMethod:
                                'https://github.com/Prometheus-X-association/consent-manager',
                            privacyRights: ['test', 'test'],
                            codeOfConduct: 'https://example.com/CoC-news-media',
                            impactAssessment: 'https://example.com/dpia',
                            authorityParty: 'DPC-IE',
                        },
                    ],
                },
                event: [
                    {
                        eventTime: '2024-11-13T17:17:16.202Z',
                        validityDuration: '0',
                        eventType: 'explicit',
                        eventState: 'consent given',
                        _id: '67351e16038969dfa74a662f',
                    },
                ],
                partyIdentification: [
                    {
                        partyId:
                            'http://host.docker.internal:4040/v1/catalog/participants/66d18a1dee71f9f096baec08',
                        partyAddress: {
                            countryCode: '',
                        },
                        partyName: 'ParticipantOne',
                        partyContact: [],
                        partyType: 'consumer',
                    },
                    {
                        partyId:
                            'http://host.docker.internal:4040/v1/catalog/participants/66d18724ee71f9f096bae810',
                        partyAddress: {
                            countryCode: '',
                        },
                        partyName: 'Test-DataProvider',
                        partyContact: [],
                        partyType: 'provider',
                    },
                ],
            },
            dataExchangeId: '673526afab71603c585ba43c',
        });
    }
    return res.status(200).json({ message: 'no action' });
});

app.post('/v1/consents/67352ce2a1d2e12d7bea1d96/token', async (req, res) => {
    if (req.body.token && req.body.providerDataExchangeId) {
        const p = {
            _id: '67352ce2a1d2e12d7bea1d96',
            contract: 'http://contract:8081/contracts/672c89942308b486f7d0bca1',
            user: '660fff4528678b2683bab15f',
            providerUserIdentifier: {
                _id: '666037e537cc7512bb4e4e65',
                attachedParticipant: '65eb2661a50cb6465d41865c',
                email: 'john@doe.com',
                identifier: '65646d4320ec42ff2e719706',
                jsonld: '',
                schema_version: 'v0.1.0',
                createdAt: '2024-06-05T10:03:17.562Z',
                updatedAt: '2024-06-05T10:03:17.562Z',
                __v: 0,
            },
            consumerUserIdentifier: {
                _id: '664f48fdc37cba87ff047f8b',
                attachedParticipant: '65eb2661a50cb6465d41865b',
                email: 'john@doe.com',
                identifier: '65646d4320ec42ff2e719706',
                url: 'http://localhost:3332/users',
                jsonld: '',
                schema_version: 'v0.1.0',
                createdAt: '2024-05-23T13:47:41.626Z',
                updatedAt: '2024-05-23T13:47:41.626Z',
                __v: 0,
            },
            consented: true,
            dataProvider: {
                _id: '65eb2661a50cb6465d41865c',
                __v: 0,
                createdAt: '2024-03-08T14:53:21.809Z',
                dataspaceEndpoint: 'http://provider:3000/',
                did: 'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                email: 'test-dataprovider@email.com',
                endpoints: {
                    dataExport: 'http://provider:3000/data/export',
                    dataImport: 'http://provider:3000/data/import',
                    consentImport: 'http://provider:3000/consent/import',
                    consentExport: 'http://provider:3000/consent/export',
                },
                jsonld: '',
                legalName: 'test-dataprovider',
                legalPerson: {
                    headquartersAddress: { countryCode: '' },
                    legalAddress: { countryCode: '' },
                    registrationNumber: '',
                    parentOrganization: [],
                    subOrganization: [],
                },
                schema_version: 'v0.1.0',
                selfDescriptionURL:
                    'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                updatedAt: '2024-03-08T14:53:21.809Z',
            },
            dataConsumer: {
                _id: '65eb2661a50cb6465d41865b',
                did: 'http://catalog:8082/v1/catalog/participants/6564aaebd853e8e05b1317c1',
                legalName: 'participatnOne',
                legalPerson: {
                    headquartersAddress: { countryCode: '' },
                    legalAddress: { countryCode: '' },
                    registrationNumber: '',
                    parentOrganization: [],
                    subOrganization: [],
                },
                selfDescriptionURL:
                    'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                email: 'participant1@email.com',
                dataspaceEndpoint: 'http://consumer:3001/',
                endpoints: {
                    dataExport: 'http://consumer:3001/data/export',
                    dataImport: 'http://consumer:3001/data/import',
                    consentImport: 'http://consumer:3001/consent/import',
                    consentExport: 'http://consumer:3001/consent/export',
                },
                jsonld: '',
                schema_version: 'v0.1.0',
                createdAt: '2024-03-08T14:53:21.809Z',
                updatedAt: '2024-03-08T14:53:21.809Z',
                __v: 0,
            },
            recipients: [
                'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
            ],
            purposes: [
                {
                    purpose: 'consumer consent data',
                    resource:
                        'http://catalog:8082/v1/catalog/softwareresources/672c8acc870a096712ca565d',
                    serviceOffering:
                        'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                    collectionMethod: [],
                    processingMethod: [],
                    piiInformation: [],
                },
            ],
            data: [
                {
                    resource:
                        'http://catalog:8082/v1/catalog/dataresources/672c8a28870a096712ca4e63',
                    serviceOffering:
                        'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                },
            ],
            status: 'granted',
            piiPrincipalRights: [],
            privacyNotice: '6734ce6eb36f3b579c928548',
            processingLocations: [],
            storageLocations: [],
            recipientThirdParties: {
                catalogId: '670e8eb6b439a2379f290fc1',
                infrastructureServices: [
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18724ee71f9f096bae810',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                        _id: '67365aa390089d27f1506888',
                    },
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec07',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8e77870a096712ca7676',
                        _id: '67365aa390089d27f1506889',
                    },
                    {
                        participant:
                            'http://catalog:8082/v1/catalog/participants/66d18a1dee71f9f096baec08',
                        serviceOffering:
                            'http://catalog:8082/v1/catalog/serviceofferings/672c8ae4870a096712ca56d7',
                        _id: '67365aa390089d27f150688a',
                    },
                ],
            },
            token: req.body.token,
            schema_version: '0.2.0',
            geographicRestrictions: [],
            services: [],
            event: [
                {
                    eventTime: '2024-11-14T20:16:32.222Z',
                    validityDuration: '0',
                    eventType: 'explicit',
                    eventState: 'consent given',
                    _id: '67365aa390089d27f150688b',
                },
            ],
            createdAt: '2024-11-14T20:16:35.473Z',
            updatedAt: '2024-11-14T20:16:35.473Z',
            __v: 0,
            providerDataExchangeId: req.body.providerDataExchangeId,
        };
        const payload = encryptPayloadAndKey(p);
        await axios.post('http://consumer:3001/consent/import', payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        return res.status(200).json({
            message:
                "Successfully sent consent to the provider's consent export endpoint to trigger the data exchange",
            consentReceipt: {
                record: {
                    schemaVersion: '0.2.0',
                    recordId: '67352ce2a1d2e12d7bea1d96',
                    piiPrincipalId: '660fff4528678b2683bab15f',
                },
                piiProcessing: {
                    privacyNotice: '6734ce6eb36f3b579c928548',
                    language: 'en',
                    purposes: [
                        {
                            purpose: 'consumer consent data',
                            lawfulBasis: 'consent',
                            piiInformation: [],
                            piiControllers: [
                                'http://host.docker.internal:4040/v1/catalog/participants/66d18724ee71f9f096bae810',
                                'http://host.docker.internal:4040/v1/catalog/participants/66d18a1dee71f9f096baec08',
                            ],
                            collectionMethod: [],
                            processingMethod: [],
                            storageLocation: [],
                            processingLocations: [],
                            geographicRestrictions: [],
                            services: [],
                            withdrawalMethod:
                                'https://github.com/Prometheus-X-association/consent-manager',
                            privacyRights: ['test', 'test'],
                            codeOfConduct: 'https://example.com/CoC-news-media',
                            impactAssessment: 'https://example.com/dpia',
                            authorityParty: 'DPC-IE',
                        },
                    ],
                },
                event: [
                    {
                        eventTime: '2024-11-13T17:17:16.202Z',
                        validityDuration: '0',
                        eventType: 'explicit',
                        eventState: 'consent given',
                        _id: '67351e16038969dfa74a662f',
                    },
                ],
                partyIdentification: [
                    {
                        partyId:
                            'http://host.docker.internal:4040/v1/catalog/participants/66d18a1dee71f9f096baec08',
                        partyAddress: {
                            countryCode: '',
                        },
                        partyName: 'ParticipantOne',
                        partyContact: [],
                        partyType: 'consumer',
                    },
                    {
                        partyId:
                            'http://host.docker.internal:4040/v1/catalog/participants/66d18724ee71f9f096bae810',
                        partyAddress: {
                            countryCode: '',
                        },
                        partyName: 'Test-DataProvider',
                        partyContact: [],
                        partyType: 'provider',
                    },
                ],
            },
            dataExchangeId: '673526afab71603c585ba43c',
        });
    }
    return res.status(200).json({ message: 'no action' });
});

const encryptPayloadAndKey = (payload) => {
    try {
        const AES_KEY_HEX = '272929e89f0ab7ba3e5d66142c67b337';
        const RSA_PRIVATE_KEY_PEM =
            '-----BEGIN PRIVATE KEY-----\n' +
            'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIeHKH+D75E9Tg\n' +
            'PdY+22U7WMVX16ai2R94GsZWGuX0bjWHuIXVAOchu99PTiw/iN6pIhF2n/PnAXLc\n' +
            'FOe2aHZhc2Mmoc8HNt0IxE8pH99RVF2XVfXh4qOCTWQt+ynNBQlnswcDCksOGpFb\n' +
            'SUt/pjOWhr2AGU8IphEHjj6A5161Txt7bsfVp7gAACyRqs+JqoTiUAZPky4hAF4D\n' +
            'pr2hZD4oNM8jnseaJ2tAazQ08ywA8yYUYGu8Knm24+SialEV01SrRZVssDs9bF7M\n' +
            'gnsRbMfwpdv4gOQJvcDIvWp7DpowSh3EtApBg4uzjuzE9lXxBB9EYoRqmlzcILst\n' +
            'DC5nG8f7AgMBAAECggEARPCS5mp68Xod712kk2oshnuxJdO99Ou49Ds08MCASw4p\n' +
            'b3qH36fXVFUA5wtpkRHXDI/wNHyuSkdHwiKYSrTi3QFq3AqyIPd/jLfBx1E0IYpj\n' +
            'QxtnGt6vPyyxIlTo2537TYOWCjgcdoWxbhSnF4dG32GHwokxkjZVzeTfXsHyYmPs\n' +
            'pqVpsF08iKI4DXLQZQUQcHKaVSculKjKTmHrAY36Dfg//2B/iH4TMtFn9ZZGaevk\n' +
            'VMlabv2EGhbAlfuOCuw+wMcVFd8n07MwJkTM9Ass9wCxxrhSQJYPyR3bBLgIslI4\n' +
            'yFtVTQ5xC6ATmMzkBlBT550vMoRtcjW2RYjhnogjkQKBgQD+HmnsfM12FYzdkm0T\n' +
            'YNBQ8ZN9C6OZfw8MlFcyP7OnUSOun1GpkPuLA/zIIHZ9B1CQHasn7Axym/Pf4YRq\n' +
            'efhogUp/aOWK/3AAsHwr9Rv/uW+xCfEDfzaFUjRh59ZqchDWHX3eqLiHlRYD6TJJ\n' +
            'G1FbsvvZpwD/WwYn2/W93jmbcQKBgQDJ9F0PZVY3vWGe6Qk/X4jIfE1Y0SYcnHO9\n' +
            'oyCSOzY/XcGzXkKw4J58CQOrKVVjNw9t15xy8U2AQerHuEIPfsdn8Opz2FdnvvWs\n' +
            'XG4L/jI0OB/JoJaOcjSUwjHo3D6yMgRKKZ8HFzypAkuYvYAUrnAoqwUYwVH5rmPF\n' +
            'ppKVmAtsKwKBgQCDjis4CsQzRaTPcGaXiZ9OyEGaktP3OxgHYyRhFylijVbzp/cW\n' +
            '2b/fkAjlcijlQUwrz7Az0rf+/U2bsZxjoxE+yPBQVXXAJ81MDhG6kAIWuWFhPcxQ\n' +
            'CyOmkZAcv3D5WmPs9QecpawiRMRI8gjeYA4Wcup/Gz4g9HaTXAQ0bz9TgQKBgAtv\n' +
            'geGATHyFhcSYz4Q+JaGsoDiaRz0xgsBHP23oWm8GIRTGDqKzZWYCoKmNgp9Gm+IN\n' +
            'Znd/wHK1yNScU2lLNYFmO/BpXLGsN38WEMkvEKqyTuJ87GmOf/m4cVkNN6Ohf2qv\n' +
            'pqihITc0wREaEemZ4xH6dSRstfaccFvdzckYvfTXAoGBAKfYGO19QN2gVA0aAoC6\n' +
            'DshYtHRoptMGnlpd4NY2I++ihLxfPz4HvDkwP5rQJo5LZDhQ8ftbwYZxuCx8uC5c\n' +
            'VxjUnRpUojStyUz0SF49I23qDWWLPLvuxjPBFUPCJuoFgctbW5GBR4xzxsmZ84lX\n' +
            'clqctAqY51fFEEBS5Tnsfhgd\n' +
            '-----END PRIVATE KEY-----';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            AES_KEY_HEX.toString().trim(),
            iv
        );
        const signedConsent = Buffer.concat([
            cipher.update(
                Buffer.from(JSON.stringify(payload)).toString(),
                'utf-8'
            ),
            cipher.final(),
        ]);

        const privateKey = CryptoJS.createPrivateKey({
            key: RSA_PRIVATE_KEY_PEM.toString().trim(),
            passphrase: '',
        });
        const encrypted = CryptoJS.privateEncrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            Buffer.from(AES_KEY_HEX).toString(),
            'utf-8'
        );

        return {
            dataProviderEndpoint: 'http://provider:3000/data/export',
            signedConsent: `${iv.toString('hex')}:${signedConsent.toString(
                'hex'
            )}`,
            encrypted,
        };
    } catch (e) {
        console.error(e);
    }
};

app.post('/v1/consents/67352ce2a1d2e12d7bea1d96/validate', (req, res) => {
    return res
        .status(200)
        .json({ message: 'token matches consent token', verified: true });
});

app.listen(8083, () => console.log('Server running on port 8083'));
