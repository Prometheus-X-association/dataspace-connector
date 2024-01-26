import { connection, Schema } from 'mongoose';
import { ICredential } from "./credential";

interface IConfiguration {
    endpoint: string;
    serviceKey: string;
    secretKey: string;
    catalogUri: string;
    contractUri: string;
    consentUri: string;
    credentials?: ICredential[];
}

const schema = new Schema({
    appKey: String,
    serviceKey: String,
    secretKey: String,
    endpoint: String,
    catalogUri: String,
    contractUri: String,
    consentUri: String,
});

const Configuration = connection.model('configurations', schema);

export { IConfiguration, Configuration };
