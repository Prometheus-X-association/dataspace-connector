import { connection, Schema } from 'mongoose';
import { CredentialTypeEnum } from '../enums/credentialTypeEnum';

interface ICredential {
    key: string;
    value: string;
    type: CredentialTypeEnum;
}

const schema = new Schema({
    key: String,
    value: String,
    type: String,
});

const Credential = connection.model('credential', schema);

export { ICredential, Credential };
