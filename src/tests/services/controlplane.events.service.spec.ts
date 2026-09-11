import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import * as configuration from '../../libs/loaders/configuration';
import { publishControlPlaneEvent } from '../../services/public/v1/controlplane.events.service';
import { IDataExchange } from '../../utils/types/dataExchange';

describe('Control Plane Event Service', () => {
    const exchange = {
        _id: { toString: () => 'exchange-id' },
        workflow: 'control-plane',
        contract: 'https://contracts.example/exchange-id',
        providerEndpoint: 'https://provider.example',
        consumerEndpoint: 'https://consumer.example',
        status: 'PENDING',
        controlPlane: {
            callbackUrl: 'https://callback.example/events',
        },
    } as unknown as IDataExchange;

    afterEach(() => {
        sinon.restore();
    });

    it('publishes one metadata-only event to each distinct recipient', async () => {
        sinon
            .stub(configuration, 'getControlPlaneWebhookUrls')
            .resolves([
                'https://listener.example/events',
                'https://callback.example/events',
            ]);
        const post = sinon.stub(axios, 'post').resolves({});

        await publishControlPlaneEvent('exchange.created', exchange);

        const eventPayload = post.firstCall.args[1] as {
            type: string;
            exchange: Record<string, unknown>;
        };
        expect(post.callCount).to.equal(2);
        expect(eventPayload).to.deep.include({
            type: 'exchange.created',
        });
        expect(eventPayload.exchange).to.not.have.property('data');
    });

    it('continues when a recipient is unavailable', async () => {
        sinon
            .stub(configuration, 'getControlPlaneWebhookUrls')
            .resolves(['https://listener.example/events']);
        sinon.stub(axios, 'post').rejects(new Error('Connection refused'));

        await publishControlPlaneEvent('transfer.failed', exchange);
        expect(true).to.equal(true);
    });
});
