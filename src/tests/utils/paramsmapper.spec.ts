import { expect } from 'chai';
import { paramsMapper } from '../../utils/paramsMapper';
import { IDataExchange } from '../../utils/types/dataExchange';

describe('Params Mapper', () => {
    it('should return a url with no mapped params', async () => {
        const mapped = await paramsMapper({
            resource: '1',
            representationQueryParams: ["limit"],
            dataExchange: {
                consumerDataExchange: '6733864197878a70cf2d5ce0',
                consumerEndpoint: 'http://host.docker.internal:3334/',
                contract: 'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
                createdAt: '2024-11-12T16:45:53.848Z',
                providerParams: {
                    query: [
                    ],
                },
                purposeId: 'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d',
                resources: [
                    {
                        serviceOffering: 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                        resource: 'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63',
                        completed: false,
                    },
                ],
                purposes: [],
                serviceChainParams: [],
                status: 'PENDING',
            } as unknown as IDataExchange,
            url: "https://test.com",
            type: "providerParams"
        })
        expect(mapped).to.have.property('url', 'https://test.com');
    });

    it('should return a url with a mapped params', async () => {
        const mapped = await paramsMapper({
            resource: '1',
            representationQueryParams: ["limit"],
            dataExchange: {
                consumerDataExchange: '6733864197878a70cf2d5ce0',
                consumerEndpoint: 'http://host.docker.internal:3334/',
                contract: 'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
                createdAt: '2024-11-12T16:45:53.848Z',
                providerParams: {
                    query: [
                        { 'limit': 25 },
                    ],
                },
                purposeId: 'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d',
                resources: [
                    {
                        serviceOffering: 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                        resource: 'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63',
                        completed: false,
                    },
                ],
                status: 'PENDING',
            } as unknown as IDataExchange,
            url: "https://test.com",
            type: "providerParams"
        })
        expect(mapped).to.have.property('url', 'https://test.com?limit=25');
    });

    it('should return a url with a mapped params added to existing params in URL', async () => {
        const mapped = await paramsMapper({
            resource: '1',
            representationQueryParams: ["limit"],
            dataExchange: {
                consumerDataExchange: '6733864197878a70cf2d5ce0',
                consumerEndpoint: 'http://host.docker.internal:3334/',
                contract: 'http://localhost:8888/contracts/672c89942308b486f7d0bca1',
                createdAt: '2024-11-12T16:45:53.848Z',
                providerParams: {
                    query: [
                        { 'limit': 25 },
                    ],
                },
                purposeId: 'http://host.docker.internal:4040/v1/catalog/softwareresources/672c8acc870a096712ca565d',
                resources: [
                    {
                        serviceOffering: 'http://host.docker.internal:4040/v1/catalog/serviceofferings/672c89cb870a096712ca4d59',
                        resource: 'http://host.docker.internal:4040/v1/catalog/dataresources/672c8a28870a096712ca4e63',
                        completed: false,
                    },
                ],
                status: 'PENDING',
            } as unknown as IDataExchange,
            url: "https://test.com?skip=2",
            type: "providerParams"
        })
        expect(mapped).to.have.property('url', 'https://test.com?skip=2&limit=25');
    });
});
