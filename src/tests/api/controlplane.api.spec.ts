import { expect } from 'chai';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import sinon from 'sinon';
import { setupEnvironment } from '../../config/environment';
import { AppServer, startServer } from '../../server';
import { DataExchange } from '../../utils/types/dataExchange';
import { Configuration } from '../../utils/types/configuration';

describe('Control Plane API', () => {
    let serverInstance: AppServer;
    let mongoServer: MongoMemoryServer;
    let bearerToken: string;

    before(async () => {
        process.env.NODE_ENV = 'test';
        process.env.EXCHANGE_TRIGGER_API_KEY = 'control-plane-api-key';
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        const readFileSyncStub = sinon.stub(fs, 'readFileSync').callsFake(() =>
            JSON.stringify({
                endpoint: 'https://consumer.example',
                serviceKey: 'service-key',
                secretKey: 'secret-key',
                catalogUri: 'https://catalog.example',
                contractUri: 'https://contract.example',
                consentUri: 'https://consent.example',
                controlPlaneEnabled: true,
                controlPlaneWebhookUrls: [],
            })
        );
        try {
            setupEnvironment();
            bearerToken = jwt.sign({}, 'secret-key');
            serverInstance = await startServer(0);
        } finally {
            readFileSyncStub.restore();
        }
    });

    after(async () => {
        delete process.env.EXCHANGE_TRIGGER_API_KEY;
        if (serverInstance) serverInstance.server.close();
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
    });

    it('returns 404 when the workflow is disabled', async () => {
        await Configuration.findOneAndUpdate(
            {},
            { controlPlaneEnabled: false }
        );

        const response = await request(serverInstance.app).get(
            '/controlplane/exchanges/507f1f77bcf86cd799439011'
        );

        expect(response.status).to.equal(404);
        expect(response.body).to.deep.equal({
            error: 'Control-plane workflow is disabled',
        });
        await Configuration.findOneAndUpdate({}, { controlPlaneEnabled: true });
    });

    it('requires a bearer token for control-plane status requests', async () => {
        const response = await request(serverInstance.app).get(
            '/controlplane/exchanges/507f1f77bcf86cd799439011'
        );

        expect(response.status).to.equal(401);
    });

    it('validates the control-plane trigger request body', async () => {
        const response = await request(serverInstance.app)
            .post('/controlplane/exchanges')
            .set('Authorization', `Bearer ${bearerToken}`)
            .send({ contract: 42 });

        expect(response.status).to.equal(400);
    });

    it('returns metadata-only status for a control-plane exchange', async () => {
        const exchange = await DataExchange.create({
            workflow: 'control-plane',
            contract: 'https://contract.example/contract-id',
            providerEndpoint: 'https://provider.example',
            consumerEndpoint: 'https://consumer.example',
            resources: [],
            purposes: [],
            status: 'PENDING',
            createdAt: new Date(),
            controlPlane: {
                authorizationExpiresAt: new Date(Date.now() + 60_000),
            },
        });

        const response = await request(serverInstance.app)
            .get(`/controlplane/exchanges/${exchange._id}`)
            .set('Authorization', `Bearer ${bearerToken}`);

        expect(response.status).to.equal(200);
        expect(response.body.content.workflow).to.equal('control-plane');
        expect(response.body.content).to.not.have.property('data');
    });

    it('requires the external trigger API key before validating the request body', async () => {
        const response = await request(serverInstance.app)
            .post('/controlplane/exchanges/external/trigger')
            .send({ contract: 42 });

        expect(response.status).to.equal(401);
        expect(response.body.error).to.equal('API key is required');
    });

    it('validates external trigger requests after API-key authentication', async () => {
        const response = await request(serverInstance.app)
            .post('/controlplane/exchanges/external/trigger')
            .set('x-exchange-trigger-api-key', 'control-plane-api-key')
            .send({ contract: 42 });

        expect(response.status).to.equal(400);
    });
});
