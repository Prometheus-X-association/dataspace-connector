import axios from "axios";
import {
    FetcherConfig,
    PolicyFetcher,
} from "../../access-control/PolicyFetcher";
import { expect } from "chai";
import app from "./utils/serviceProviderInformer";
import {
    AccessRequest,
    PEP,
} from "../../access-control/PolicyEnforcementPoint";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

axios.defaults.baseURL = "";

const SERVER_PORT = 9090;
const POLICY_FETCHER_CONFIG: FetcherConfig = Object.freeze({
    count: {
        url: `http://localhost:${SERVER_PORT}/data`,
        remoteValue: "context.count",
    },
    language: {
        url: `http://localhost:${SERVER_PORT}/document/@{id}`,
        remoteValue: "document.lang",
    },
});

const fetcher = new PolicyFetcher(POLICY_FETCHER_CONFIG);
PEP.showLog = true;

describe("Access control testing", () => {
    before(async () => {
        await app.startServer(SERVER_PORT);
    });

    it("Should get a 'count' value from a service", async () => {
        const count = await fetcher.context.count();
        expect(count).to.be.equal(5);
    });

    it("Should get the 'language' value of a document delivered by a service", async () => {
        const SERVICE_RESOURCE_ID_A = 2;
        fetcher.setOptionalFetchingParams({
            language: { id: SERVICE_RESOURCE_ID_A },
        });
        const languageFr = await fetcher.context.language();
        expect(languageFr).to.be.equal("fr");

        const SERVICE_RESOURCE_ID_B = 0;
        fetcher.setOptionalFetchingParams({
            language: { id: SERVICE_RESOURCE_ID_B },
        });
        const languageEn = await fetcher.context.language();
        expect(languageEn).to.be.equal("en");
    });

    it("Should make a simple request through the PEP/PDP", async () => {
        const contractUrl = new URL(
            path.join("contracts/", process.env.CONTRACT_TEST_ID),
            process.env.CONTRACT_API_URL
        ).toString();
        const request: AccessRequest = {
            action: "use",
            target: "http://service-offering-resource/",
            contractUrl,
            config: {},
        };
        const success = await PEP.requestAction(request);
        expect(success).to.be.equal(true);
    });
});
