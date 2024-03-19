import { connection, Schema } from 'mongoose';

interface IUser {
    _id: string;
    internalID: string;
    consentID?: string;
    email: string;
    userIdentifier?: string;
    userId?: string;
}

const schema = new Schema<IUser>({
    internalID: String,
    email: String,
    userIdentifier: String,
    consentID: String,
});

const User = connection.model('user', schema);

export { IUser, User };
