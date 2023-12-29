import axios from "axios";
import { PolicyFetcher } from "../../access-control/PolicyFetcher";
import { expect } from "chai";
import app from "./utils/serviceProvider";

axios.defaults.baseURL = "";

const SERVER_PORT = 9090;
const fetcher = new PolicyFetcher({
    count: {
        url: `http://localhost:${SERVER_PORT}/data`,
        remoteValue: "context.count",
    },
    language: {
        url: `http://localhost:${SERVER_PORT}/document/@{id}`,
        remoteValue: "document.lang",
    },
});

describe("Access control testing", () => {
    before(async () => {
        await app.startServer(SERVER_PORT);
    });

    it("Should get a 'count' value from a service", async () => {
        const count = await fetcher.call("count");
        expect(count).to.be.equal(5);
    });

    it("Should get the 'language' value of a document delivered by a service", async () => {
        const SERVICE_RESOURCE_ID = 2;
        const language = await fetcher.call("language", {
            params: {
                id: SERVICE_RESOURCE_ID,
            },
        });
        expect(language).to.be.equal("fr");
    });
});
