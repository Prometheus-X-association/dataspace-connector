import { connection, Schema } from 'mongoose';
import { ICredential } from './credential';

interface IModalOrigin {
    jwt: string;
    origin: string;
}

interface IConfiguration {
    endpoint: string;
    serviceKey: string;
    secretKey: string;
    catalogUri: string;
    contractUri: string;
    consentUri: string;
    registrationUri: string;
    billingUri: string;
    dvctUri: string;
    modalOrigins?: IModalOrigin[];
    credentials?: ICredential[];
    consentJWT?: string;
    expressLimitSize?: string;
}

const ModalOriginSchema = new Schema({
    jwt: String,
    origin: String,
});

const schema = new Schema({
    appKey: String,
    serviceKey: String,
    secretKey: String,
    endpoint: String,
    catalogUri: String,
    contractUri: String,
    consentUri: String,
    registrationUri: String,
    billingUri: String,
    dvctUri: String,
    modalOrigins: [ModalOriginSchema],
    consentJWT: String,
});

const Configuration = connection.model('configurations', schema);

export { IConfiguration, Configuration };
