import { connection, Schema } from "mongoose";

interface IConfiguration {
    endpoint: string;
    serviceKey: string;
    secretKey: string;
    catalogUri: string;
    consentUri: string;
}

const schema = new Schema({
    appKey: String,
    serviceKey: String,
    secretKey: String,
    endpoint: String,
    catalogUri: String,
    consentUri: String,
});

const Configuration = connection.model("configurations", schema);

export { IConfiguration, Configuration };
