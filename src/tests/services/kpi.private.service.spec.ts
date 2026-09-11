import { expect } from 'chai';
import sinon from 'sinon';
import { DataExchange } from '../../utils/types/dataExchange';
import {
    getKpiOverviewService,
    getKpiByOfferService,
    getKpiServiceChainService,
    getKpiSimpleService,
    getKpiVolumeService,
} from '../../services/private/v1/kpi.private.service';

describe('KPI Private Service', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('getKpiOverviewService', () => {
        it('should return correct overview when there are exchanges', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    total: [{ count: 10 }],
                    completed: [{ count: 8 }],
                    successful: [{ count: 6 }],
                    bytes: [{ total: 2048 }],
                    serviceChain: [{ count: 3 }],
                    simple: [{ count: 7 }],
                },
            ]);

            const result = await getKpiOverviewService();

            expect(result.totalExchanges).to.equal(10);
            expect(result.completedExchanges).to.equal(8);
            expect(result.successfulExchanges).to.equal(6);
            expect(result.globalSuccessRate).to.equal(0.6);
            expect(result.totalBytesTransferred).to.equal(2048);
            expect(result.serviceChainExchanges).to.equal(3);
            expect(result.simpleExchanges).to.equal(7);
        });

        it('should return zero success rate when totalExchanges is 0', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    total: [],
                    completed: [],
                    successful: [],
                    bytes: [],
                    serviceChain: [],
                    simple: [],
                },
            ]);

            const result = await getKpiOverviewService();

            expect(result.totalExchanges).to.equal(0);
            expect(result.globalSuccessRate).to.equal(0);
            expect(result.totalBytesTransferred).to.equal(0);
        });
    });

    describe('getKpiByOfferService', () => {
        it('should return KPIs grouped by resource offering', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    _id: 'https://catalog.api.com/serviceofferings/abc',
                    totalExchanges: 5,
                    successfulExchanges: 4,
                },
                {
                    _id: 'https://catalog.api.com/serviceofferings/xyz',
                    totalExchanges: 2,
                    successfulExchanges: 1,
                },
            ]);

            const result = await getKpiByOfferService('resource');

            expect(result).to.have.length(2);
            expect(result[0].serviceOffering).to.equal(
                'https://catalog.api.com/serviceofferings/abc'
            );
            expect(result[0].successRate).to.equal(0.8);
            expect(result[1].successRate).to.equal(0.5);
        });

        it('should return an empty array when no exchanges exist', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([]);

            const result = await getKpiByOfferService();

            expect(result).to.deep.equal([]);
        });

        it('should return 0 successRate when totalExchanges is 0', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    _id: 'https://catalog.api.com/serviceofferings/abc',
                    totalExchanges: 0,
                    successfulExchanges: 0,
                },
            ]);

            const result = await getKpiByOfferService();

            expect(result[0].successRate).to.equal(0);
        });
    });

    describe('getKpiServiceChainService', () => {
        it('should return service chain KPIs', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    total: [{ count: 12 }],
                    successful: [{ count: 9 }],
                },
            ]);

            const result = await getKpiServiceChainService();

            expect(result.totalServiceChainExchanges).to.equal(12);
            expect(result.successfulServiceChainExchanges).to.equal(9);
            expect(result.successRate).to.equal(0.75);
        });

        it('should return 0 successRate when no service chain exchanges exist', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    total: [],
                    successful: [],
                },
            ]);

            const result = await getKpiServiceChainService();

            expect(result.totalServiceChainExchanges).to.equal(0);
            expect(result.successRate).to.equal(0);
        });
    });

    describe('getKpiSimpleService', () => {
        it('should return simple exchange KPIs', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    total: [{ count: 20 }],
                    successful: [{ count: 15 }],
                },
            ]);

            const result = await getKpiSimpleService();

            expect(result.totalSimpleExchanges).to.equal(20);
            expect(result.successfulSimpleExchanges).to.equal(15);
            expect(result.successRate).to.equal(0.75);
        });

        it('should return 0 successRate when no simple exchanges exist', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    total: [],
                    successful: [],
                },
            ]);

            const result = await getKpiSimpleService();

            expect(result.totalSimpleExchanges).to.equal(0);
            expect(result.successRate).to.equal(0);
        });
    });

    describe('getKpiVolumeService', () => {
        it('should return volume data with day breakdown', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    bytes: [{ total: 4096 }],
                    byDay: [
                        { _id: '2026-03-01', count: 5 },
                        { _id: '2026-03-02', count: 3 },
                    ],
                },
            ]);

            const result = await getKpiVolumeService();

            expect(result.totalBytesTransferred).to.equal(4096);
            expect(result.exchangesByDay).to.deep.equal([
                { date: '2026-03-01', count: 5 },
                { date: '2026-03-02', count: 3 },
            ]);
            expect(result.byteCoverageNote).to.be.a('string');
        });

        it('should return 0 bytes and empty day array when no data', async () => {
            sinon.stub(DataExchange, 'aggregate').resolves([
                {
                    bytes: [],
                    byDay: [],
                },
            ]);

            const result = await getKpiVolumeService();

            expect(result.totalBytesTransferred).to.equal(0);
            expect(result.exchangesByDay).to.deep.equal([]);
        });

        it('should pass date filters to the aggregation pipeline', async () => {
            const aggregateStub = sinon
                .stub(DataExchange, 'aggregate')
                .resolves([{ bytes: [], byDay: [] }]);

            await getKpiVolumeService('2026-01-01', '2026-03-31');

            const pipeline = aggregateStub.firstCall.args[0] as Record<string, any>[];
            const matchStage = pipeline[0]['$match'];
            expect(matchStage).to.have.property('createdAt');
            expect(matchStage.createdAt.$gte).to.be.instanceOf(Date);
            expect(matchStage.createdAt.$lte).to.be.instanceOf(Date);
        });
    });
});
