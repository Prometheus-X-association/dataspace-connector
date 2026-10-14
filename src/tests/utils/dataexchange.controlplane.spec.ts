import { expect } from 'chai';
import axios from 'axios';
import sinon from 'sinon';
import { DataExchange } from '../../utils/types/dataExchange';

describe('Control Plane Data Exchange Synchronization', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('synchronizes metadata to the provider peer record', async () => {
        const exchange = DataExchange.hydrate({
            _id: '507f1f77bcf86cd799439011',
            workflow: 'control-plane',
            contract: 'https://contract.example/contract-id',
            providerEndpoint: 'https://provider.example',
            consumerEndpoint: 'https://consumer.example',
            providerDataExchange: '507f1f77bcf86cd799439012',
            status: 'PENDING',
            controlPlane: {
                authorizationExpiresAt: new Date(Date.now() + 60_000),
            },
        });
        const put = sinon.stub(axios, 'put').resolves({});
        sinon.stub(exchange, 'save').resolves(exchange);

        await exchange.syncControlPlane();

        expect(put.calledOnce).to.equal(true);
        expect(put.firstCall.args[0]).to.equal(
            'https://provider.example/dataexchanges/507f1f77bcf86cd799439012'
        );
        expect(put.firstCall.args[1]).to.deep.include({
            providerEndpoint: 'https://provider.example',
            consumerEndpoint: 'https://consumer.example',
            workflow: 'control-plane',
        });
    });
});
