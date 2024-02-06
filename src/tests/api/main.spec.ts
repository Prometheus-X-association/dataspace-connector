import { expect } from "chai";
import request from "supertest";
import { config } from "dotenv";
config();

import { IncomingMessage, Server, ServerResponse } from "http";
import { startServer } from "../../server";

describe("API Tests", () => {
    let app: Express.Application;
    let server: Server<typeof IncomingMessage, typeof ServerResponse>;

    before(async (done) => {
        const file = {
            "endpoint": "https://test.com",
            "serviceKey": "789456123",
            "secretKey": "789456123",
            "catalogUri": "https://test.com",
            "contractUri": "https://test.com",
        }
        const originalReadFileSync = require('fs').readFileSync;
        require('fs').readFileSync = () => JSON.stringify(file);

        await startServer(9090).then(
            (serverInstance) => {
                app = serverInstance.app;
                server = serverInstance.server;
                done();
            }
        );

        done();
    });

    // after((done) => {
    //     // Close the server after all tests are completed
    //     server.close(() => {
    //
    //     });
    // });

    describe("GET /health", () => {
        it("Should respond with json and a value of OK", async (done) => {
            const response = await request(app).get("/health");
            expect(response.status).equal(200, "Status should be 200");
            expect(response.body.status).equal("OK", "Value is OK");
        });
    });
//
//     describe("GET /v1/references", () => {
//         it("should return a valid response with an array of elements", async () => {
//             const response = await request(app).get("/v1/references");
//             expect(response.status).to.equal(200);
//             expect(response.body).to.be.an("array");
//         });
//     });
//
//     describe("GET /v1/references/:type", () => {
//         it("should return a valid response with an array of elements", async () => {
//             const res = await request(app).get("/v1/references/business-model");
//             expect(res.status).to.equal(200);
//             expect(res.body).to.be.an("array");
//         });
//     });
//
//     describe("GET /v1/references/:type - invalid type", () => {
//         it("should return an error specifying the type is unknown", async () => {
//             const res = await request(app).get("/v1/references/unknowntype");
//             expect(res.status).to.equal(400);
//             expect(res.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "Unknown Reference Type");
//         });
//     });
//
//     describe("POST /v1/references/:type", () => {
//         it("should successfully create a reference with type 'roles'", async () => {
//             const payload = {
//                 title: "TEST Role",
//                 roleDefinitions: ["Role 1", "Role 2", "Role 3"],
//                 responsibilitiesAndObligations: ["Responsibility 1", "Obligation 1"],
//                 descriptions: [{ "@language": "en", "@value": "Definition 1" }],
//             };
//
//             const res = await request(app)
//                 .post("/v1/references/roles")
//                 .send(payload)
//                 .set("Content-Type", "application/json");
//
//             expect(res.status).to.equal(201);
//         });
//
//         it("should successfully create a reference with type 'business-model'", async () => {
//             const payload = {
//                 title: "TEST Business Model",
//                 definitions: [
//                     { "@language": "en", "@value": "Description" },
//                     { "@language": "fr", "@value": "Description" },
//                 ],
//             };
//
//             const res = await request(app)
//                 .post("/v1/references/business-model")
//                 .send(payload)
//                 .set("Content-Type", "application/json");
//
//             expect(res.status).to.equal(201);
//         });
//     });
//
//     describe("GET /v1/references/:type/:fileName", () => {
//         it("should return a valid response with an object", async () => {
//             const res = await request(app).get("/v1/references/architecture/base");
//             expect(res.status).to.equal(200);
//             expect(res.body).to.be.an("object");
//         });
//     });
//
//     describe("GET /v1/references/:type/:fileName - invalid type", () => {
//         it("should return an error specifying the type is unknown", async () => {
//             const res = await request(app).get("/v1/references/unknowntype/base");
//             expect(res.status).to.equal(400);
//             expect(res.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "Unknown Reference Type");
//         });
//     });
//
//     describe("GET /v1/references/:type/:fileName - not found file", () => {
//         it("should return an 404 error", async () => {
//             const res = await request(app).get("/v1/references/architecture/unknowFileName");
//             expect(res.status).to.equal(404);
//             expect(res.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "Reference not found");
//         });
//     });
//
//     describe("GET /v1/jobs - API KEY error", () => {
//         it("should respond with code 400 and Header error", async () => {
//             const response = await request(app).get("/v1/jobs");
//             expect(response.status).to.equal(400);
//             expect(response.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "Header Error");
//         });
//     });
//
//     describe("GET /v1/jobs", () => {
//         it("should respond with json and an array of job configurations", async () => {
//             const response = await request(app).get("/v1/jobs").set({ "x-api-key": process.env.API_KEY});
//             expect(response.status).to.equal(200);
//             expect(response.body).to.be.an("array");
//         });
//     });
//
//     describe("GET /v1/jobs/:job  - API KEY error", () => {
//         it("should respond with code 400 and Header error", async () => {
//
//             const response = await request(app).get(`/v1/jobs/dbUpdate`);
//             expect(response.status).to.equal(400);
//             expect(response.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "Header Error");
//         });
//     });
//
//     describe("GET /v1/jobs/:job  - Job name error", () => {
//         it("should respond with code 400 and Job name error", async () => {
//
//             const response = await request(app).get(`/v1/jobs/unknownJob`).set({ "x-api-key": process.env.API_KEY});
//             expect(response.status).to.equal(400);
//             expect(response.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "job name is not valid");
//         });
//     });
//
//     describe("GET /v1/jobs/:job", () => {
//         it("should respond with json and a job configuration for the specified job", async () => {
//
//             const response = await request(app).get(`/v1/jobs/dbUpdate`).set({ "x-api-key": process.env.API_KEY});
//             expect(response.status).to.equal(200);
//         });
//     });
//
//     describe("PATCH /v1/jobs/:job - API KEY error", () => {
//         it("should respond with code 400 and Header error", async () => {
//
//             const response = await request(app).patch(`/v1/jobs/dbUpdate`);
//             expect(response.status).to.equal(400);
//             expect(response.body)
//                 .to.be.an("object")
//                 .that.has.property("error", "Header Error");
//         });
//     });
//
//     describe("PATCH /v1/jobs/:job - Job name error", () => {
//         it("should respond with code 400 and Job name error", async () => {
//
//             const payload = {
//                 scheduled: true,
//                 frequency: FrequencyEnum.DAILY,
//             };
//
//             const response = await request(app)
//                 .patch(`/v1/jobs/unknownJob`)
//                 .send(payload)
//                 .set({
//                     "x-api-key": process.env.API_KEY,
//                     "Content-Type": "application/json"
//                 });
//
//             expect(response.status).to.equal(400);
//             expect(response.body).to.be.an("object")
//                 .that.has.property("error", "job name is not valid");
//         });
//     });
//
//     describe("PATCH /v1/jobs/:job - Frequency input wrong format", () => {
//         it("should respond with code 400 and frequency validation error", async () => {
//
//             const payload = {
//                 frequency: "daily",
//             };
//
//             const response = await request(app)
//                 .patch(`/v1/jobs/dbUpdate`)
//                 .send(payload)
//                 .set({
//                     "x-api-key": process.env.API_KEY,
//                     "Content-Type": "application/json"
//                 });
//
//             expect(response.status).to.equal(400);
//             expect(response.body).to.be.an("object").that.has.property("error", "frequency is not valid");
//         });
//     });
//
//     describe("PATCH /v1/jobs/:job", () => {
//         it("should update a job configuration and respond with the updated data", async () => {
//
//             const payload = {
//                 scheduled: true,
//                 frequency: FrequencyEnum.DAILY,
//             };
//
//             const response = await request(app)
//                 .patch(`/v1/jobs/dbUpdate`)
//                 .send(payload)
//                 .set({
//                     "x-api-key": process.env.API_KEY,
//                     "Content-Type": "application/json"
//                 });
//
//             expect(response.status).to.equal(201);
//             expect(response.body).to.be.an("object").that.has.property("scheduled", true);
//         });
//     });
});
