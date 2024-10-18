import { expect } from 'chai';
import { startServer, AppServer } from '../../server';
import { config, setupEnvironment } from '../../config/environment';
import { InfastructureWebhookService, triggerInfrastructureFlowService } from '../../services/public/v1/infrastructure.public.service';
import axios from 'axios';
import sinon from 'sinon';
import { DataExchange, IDataExchange } from '../../utils/types/dataExchange';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('Infrastructure API tests', () => {
    let serverInstance: AppServer;
    let axiosGetStub: sinon.SinonStub;
    let axiosPostStub: sinon.SinonStub;
    process.env.NODE_ENV = 'test';
    let mongoServer: MongoMemoryServer;
    let dataExchange: any;

    const originalReadFileSync = require('fs').readFileSync;
    const data = {
        "id": "customer-123456",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "skills": ["skill1", "skill2", "skill3"],
    }

    const dataProcessing = {
        serviceOffering: "https://infrastructure.com",
        participant: "https://participant.com",
    }

    before(async () => {

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        dataExchange = new DataExchange({
            providerEndpoint: "https://provider.com",
            resources: [{
                serviceOffering: "https://serviceOffering.com",
                resource: "https://resource.com",
            }],
            contract: "https://contract.com",
            consumerEndpoint: "https://consumer.com",
            consumerDataExchange: "ezef854a4fa463a4fa3",
            providerDataExchange: "ezef854a4fa463a4fa4",
            status: "PENDING",
            dataProcessings: [{
                serviceOffering: "https://infrastructure.com",
                participant: "https://participant.com",
            }],
        });
    
        await dataExchange.save();

        const file = {
            "endpoint": "https://test.com",
            "serviceKey": "789456123",
            "secretKey": "789456123",
            "catalogUri": "https://test.com",
            "contractUri": "https://test.com",
            "consentUri": "https://test.com",
        }

        require('fs').readFileSync = () => JSON.stringify(file);
        setupEnvironment();
        serverInstance = await startServer(config.port);

        // Mock axios.get
        axiosGetStub = sinon.stub(axios, 'get');
        axiosGetStub.withArgs(dataProcessing.serviceOffering).resolves({ data: { serviceOffering: 'mocked data' } });
        axiosGetStub.withArgs(dataProcessing.participant).resolves({ data: { dataspaceEndpoint: 'https://dataspace.test.com' } });
        axiosGetStub.withArgs('https://dataspace.test.com').resolves({ data: { _links: { infrastructure: 'https://test.pdc.com/infrastructure' } } });
        
        // Mock axios.post
        axiosPostStub = sinon.stub(axios, 'post');
        axiosPostStub.withArgs('https://dataspace.test.com/dataexchanges').resolves({
            _id: "ezef854a4fa463a4fa8",
            providerEndpoint: "https://provider.com",
            resources: [{
                serviceOffering: "https://serviceOffering.com",
                resource: "https://resource.com",
            }],
            contract: "https://contract.com",
            consumerEndpoint: "https://consumer.com",
            consumerDataExchange: "ezef854a4fa463a4fa3",
            providerDataExchange: "ezef854a4fa463a4fa4",
            status: "PENDING",
            dataProcessings: [{
                serviceOffering: "https://infrastructure.com",
                participant: "https://participant.com",
            }],
        });
        axiosPostStub.withArgs('https://test.pdc.com/infrastructure').resolves({ timestamp: 1728914623218, code: 200, content: { success: true } });
    });

    after(async () => {
        require('fs').readFileSync = originalReadFileSync;
        serverInstance.server.close();
        console.log("Server closed");
        axiosGetStub.restore(); 
        axiosPostStub.restore();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    describe("InfastructureWebhookService", () => {
        it("Should be true", async () => {
            const response = await InfastructureWebhookService(dataExchange._id.toString(), data);
            expect(response).equal(true);
        })
    });

    describe("triggerInfrastructureFlowService", () => {
        it("Should respond with OK and 200 status code", async () => {
            const response = await triggerInfrastructureFlowService(dataProcessing, dataExchange, data);
            expect(response).equal(true);
        })
    });
});
