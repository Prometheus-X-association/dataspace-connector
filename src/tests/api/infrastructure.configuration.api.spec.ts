import { expect } from 'chai';
import { startServer, AppServer } from '../../server';
import request from "supertest";
import { config, setupEnvironment } from '../../config/environment';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getSecretKey, getServiceKey } from '../../libs/loaders/configuration';
dotenv.config({ path: '.env.test' });

describe('Infrastructure Configuration API tests', () => {
    let serverInstance: AppServer;
    process.env.NODE_ENV = 'test';
    const originalReadFileSync = require('fs').readFileSync;
    let mongoServer: MongoMemoryServer;
    let infrastructureConfigurationId: string;
    let token: string;

    before(async () => {

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        setupEnvironment('test');
        serverInstance = await startServer(config.port);

        //login
        const response = await request(serverInstance.app).post("/login").send({
            serviceKey: await getServiceKey(),
            secretKey: await getSecretKey()
        });
        token = response.body.content.token;
    });

    after(async () => {
        require('fs').readFileSync = originalReadFileSync;
        serverInstance.server.close();
        console.log("Server closed");
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    describe("POST /private/infrastructure/configurations", () => {
        it("Should respond with OK and 201 status code", async () => {
            const data = {
                "verb": "POST",
                "data": "rawData",
                "service": "https://test.com",
                "resource": "https://test.com/resource"
            }
            const response = await request(serverInstance.app).post("/private/infrastructure/configurations").set('Authorization', `Bearer ${token}`).send(data);
            expect(response.status).equal(201, "Status should be 201");
            expect(response.body.content).to.have.property('_id');
            infrastructureConfigurationId = response.body.content._id;
        })
    });

    describe("GET /private/infrastructure/configurations", () => {
        it("Should respond with OK and 200 status code", async () => {
            const response = await request(serverInstance.app).get("/private/infrastructure/configurations").set('Authorization', `Bearer ${token}`);
            expect(response.status).equal(200, "Status should be 200");
            expect(response.body.content.length).equal(1);
        })
    });

    describe("GET /infrastructure/configurations/:id", () => {
        it("Should respond with OK and 200 status code", async () => {
            const response = await request(serverInstance.app).get(`/private/infrastructure/configurations/${infrastructureConfigurationId}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).equal(200, "Status should be 200");
            expect(response.body.content.verb).equal("POST");
            expect(response.body.content.data).equal("rawData");
            expect(response.body.content.service).equal("https://test.com");
        })
    });

    describe("PUT /infrastructure/configurations/:id", () => {
        it("Should respond with OK and 200 status code", async () => {
            const data = {
                "verb": "POST",
                "data": "rawData:augmentedData",
                "service": "https://test.com/service/1",
                "resource": "https://test.com/resource/1"
            }
            const response = await request(serverInstance.app).put(`/private/infrastructure/configurations/${infrastructureConfigurationId}`).set('Authorization', `Bearer ${token}`).send(data);
            expect(response.status).equal(200, "Status should be 200");
            expect(response.body.content.verb).equal("POST");
            expect(response.body.content.data).equal("rawData:augmentedData");
            expect(response.body.content.service).equal("https://test.com/service/1");
            expect(response.body.content.resource).equal("https://test.com/resource/1");
        })
    });

    describe("DELETE /infrastructure/configurations/:id", () => {
        it("Should respond with OK and 200 status code", async () => {
            const response = await request(serverInstance.app).delete(`/private/infrastructure/configurations/${infrastructureConfigurationId}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).equal(200, "Status should be 200");
        })
    });
});
