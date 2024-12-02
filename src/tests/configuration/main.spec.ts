import app from "./utils/configuration";
import { getConfigFile } from "../../libs/loaders/configuration";
import { expect } from "chai";
import { after } from "node:test";


const SERVER_PORT = 9090;
describe('Configuration file testing', () => {
    const emptyFile = {
        "endpoint": "",
        "serviceKey": "",
        "secretKey": "",
        "catalogUri": "",
        "contractUri": "",
        "consentUri": "",
    }

    const file = {
        "endpoint": "https://test.com",
        "serviceKey": "789456123",
        "secretKey": "789456123",
        "catalogUri": "https://test.com",
        "contractUri": "https://test.com",
        "consentUri": "https://test.com",
    }

    before(async () => {
        await app.startServer(SERVER_PORT);
    });

    after(async () => {
        process.exit(1)
    })

    it('should return a valid configuration object when config.json exists', () => {
        // Implement your test logic here
        // Mock the fs.readFileSync function to return a valid config without required variables
        const originalReadFileSync = require('fs').readFileSync;
        require('fs').readFileSync = () => JSON.stringify(file);

        const config = getConfigFile();
        expect(config).to.be.an('object');
        expect(config.endpoint).to.be.a('string');

        // Restore the original readFileSync function
        require('fs').readFileSync = originalReadFileSync;
    });

    it('should throw an error when config.json is missing', () => {
        expect(getConfigFile).to.throw('Please create a config.json file inside the src directory and add the needed variables before building the connector');
    });

    it('should throw an error when required variables are missing in config.json', () => {
        // Implement your test logic here
        // Mock the fs.readFileSync function to return a valid config without required variables
        const originalReadFileSync = require('fs').readFileSync;
        require('fs').readFileSync = () => JSON.stringify(emptyFile);

        expect(getConfigFile).to.throw('Missing variables in the config.json');

        // Restore the original readFileSync function
        require('fs').readFileSync = originalReadFileSync;
    });

});