import { startServer, AppServer } from '../../server';
import { config, setupEnvironment } from '../../config/environment';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { DataExchange } from '../../utils/types/dataExchange';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

describe('Infrastructure API tests', () => {
    let serverInstance: AppServer;
    process.env.NODE_ENV = 'test';
    const originalReadFileSync = require('fs').readFileSync;
    let mongoServer: MongoMemoryServer;

    before(async () => {

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        const dataExchange = await DataExchange.create({
            providerEndpoint: "https://test.com",
            resources: [],
            providerDataExchange: "https://test.com",
            status: "PENDING",
            consumerDataExchange: "https://test.com",
            contract: "https://test.com",
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
    });

    after(async () => {
        require('fs').readFileSync = originalReadFileSync;
        serverInstance.server.close();
        console.log("Server closed");
        await mongoose.connection.close();
        await mongoServer.stop();
    });
});
