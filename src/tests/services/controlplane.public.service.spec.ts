import { expect } from 'chai';
import sinon from 'sinon';
import * as configuration from '../../libs/loaders/configuration';
import * as pep from '../../utils/pepVerification';
import * as events from '../../services/public/v1/controlplane.events.service';
import * as consumerService from '../../services/public/v1/consumer.public.service';
import * as provider from '../../libs/third-party/provider';
import * as consumer from '../../libs/third-party/consumer';
import * as representations from '../../libs/loaders/representationFetcher';
import { DataExchangeStatusEnum } from '../../utils/enums/dataExchangeStatusEnum';
import { DataExchange, IDataExchange } from '../../utils/types/dataExchange';
import {
    authorizeControlPlaneParticipant,
    createControlPlaneExchange,
    reportControlPlaneTransfer,
} from '../../services/public/v1/controlplane.public.service';

describe('Control Plane Service', () => {
    const createExchange = (): IDataExchange =>
        ({
            _id: { toString: () => 'exchange-id' },
            workflow: 'control-plane',
            contract: 'https://contracts.example/contract-id',
            providerEndpoint: 'https://provider.example',
            consumerEndpoint: 'https://consumer.example',
            resources: [{ resource: 'https://catalog.example/data' }],
            purposes: [{ resource: 'https://catalog.example/purpose' }],
            status: DataExchangeStatusEnum.PENDING,
            createdAt: new Date().toISOString(),
            controlPlane: {
                authorizationExpiresAt: new Date(Date.now() + 60_000),
            },
            save: sinon.stub().resolves(),
            syncWithParticipant: sinon.stub().resolves(),
            syncControlPlane: sinon.stub().resolves(),
            createDataExchangeToOtherParticipant: sinon.stub().resolves(),
            updateStatus: sinon.stub().resolves(),
            updateProviderData: sinon.stub().resolves(),
            syncWithInfrastructure: sinon.stub().resolves(),
            completeServiceChain: sinon.stub().resolves(),
        } as unknown as IDataExchange);

    afterEach(() => {
        sinon.restore();
    });

    it('creates a bilateral exchange without invoking data-plane helpers', async () => {
        const exchange = createExchange();
        sinon
            .stub(configuration, 'getEndpoint')
            .resolves(exchange.consumerEndpoint);
        sinon.stub(consumerService, 'triggerBilateralFlow').resolves({
            dataExchange: exchange,
            providerEndpoint: exchange.providerEndpoint,
        });
        sinon.stub(events, 'publishControlPlaneEvent').resolves();
        const providerExport = sinon.stub(provider, 'providerExport');
        const providerImport = sinon.stub(provider, 'providerImport');
        const consumerImport = sinon.stub(consumer, 'consumerImport');
        const getRepresentation = sinon.stub(
            representations,
            'getRepresentation'
        );
        const postRepresentation = sinon.stub(
            representations,
            'postRepresentation'
        );

        const result = await createControlPlaneExchange({
            contract: 'https://bilaterals.example/contract-id',
        });

        expect(result.workflow).to.equal('control-plane');
        expect(exchange.controlPlane?.authorizationExpiresAt).to.be.instanceOf(
            Date
        );
        expect(providerExport.called).to.equal(false);
        expect(providerImport.called).to.equal(false);
        expect(consumerImport.called).to.equal(false);
        expect(getRepresentation.called).to.equal(false);
        expect(postRepresentation.called).to.equal(false);
    });

    it('authorizes the local provider using policy verification only', async () => {
        const exchange = createExchange();
        sinon.stub(DataExchange, 'findById').resolves(exchange);
        sinon
            .stub(configuration, 'getEndpoint')
            .resolves(exchange.providerEndpoint);
        const verification = sinon.stub(pep, 'pepVerification').resolves({
            success: true,
            contractID: 'contract-id',
            resourceID: 'data',
        });
        sinon.stub(events, 'publishControlPlaneEvent').resolves();

        const result = await authorizeControlPlaneParticipant(
            'exchange-id',
            'provider'
        );

        expect(result.authorized).to.equal(true);
        expect(verification.calledOnce).to.equal(true);
        expect(exchange.controlPlane?.providerAuthorizedAt).to.be.instanceOf(
            Date
        );
        expect(
            (exchange.syncControlPlane as sinon.SinonStub).calledOnce
        ).to.equal(true);
    });

    it('rejects transfer reporting until the local participant is authorized', async () => {
        const exchange = createExchange();
        sinon.stub(DataExchange, 'findById').resolves(exchange);
        sinon
            .stub(configuration, 'getEndpoint')
            .resolves(exchange.providerEndpoint);

        try {
            await reportControlPlaneTransfer('exchange-id', 'provider', true, {
                checksum: 'sha256:example',
                mimetype: 'application/json',
                size: 1024,
            });
            expect.fail('Expected transfer reporting to be rejected');
        } catch (error) {
            expect((error as Error).message).to.equal(
                'Participant must be authorized before reporting transfer status'
            );
        }

        expect(exchange.providerData).to.equal(undefined);
        expect((exchange.syncControlPlane as sinon.SinonStub).called).to.equal(
            false
        );
    });

    it('records only completion metadata after local provider authorization', async () => {
        const exchange = createExchange();
        exchange.controlPlane = {
            ...exchange.controlPlane,
            providerAuthorizedAt: new Date(),
        };
        sinon.stub(DataExchange, 'findById').resolves(exchange);
        sinon
            .stub(configuration, 'getEndpoint')
            .resolves(exchange.providerEndpoint);
        sinon.stub(events, 'publishControlPlaneEvent').resolves();

        const result = await reportControlPlaneTransfer(
            'exchange-id',
            'provider',
            true,
            {
                checksum: 'sha256:example',
                mimetype: 'application/json',
                size: 1024,
            }
        );

        expect(result.status).to.equal(DataExchangeStatusEnum.EXPORT_SUCCESS);
        expect(result.providerData).to.deep.equal({
            checksum: 'sha256:example',
            mimetype: 'application/json',
            size: 1024,
        });
        expect(result).to.not.have.property('data');
        expect(
            (exchange.syncControlPlane as sinon.SinonStub).calledOnce
        ).to.equal(true);
    });
});
