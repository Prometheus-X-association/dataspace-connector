import { connection, Schema } from 'mongoose';
import { CredentialTypeEnum } from '../enums/credentialTypeEnum';

interface ICredential {
    _id: string;
    key: string;
    value: string;
    content: object;
    type: CredentialTypeEnum;
}

const schema = new Schema({
    _id: String,
    key: { type: String, required: false },
    value: { type: String, required: false },
    type: { type: String, required: true },
    content: { type: Object, required: false },
});

const Credential = connection.model('credential', schema);

export { ICredential, Credential };
