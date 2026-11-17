import { connection, Schema } from 'mongoose';

interface IUser {
    _id: string;
    internalID: string;
    consentID?: string;
    email: string;
    userIdentifier?: string;
    userId?: string;
    url?: string;
    legalGuardian?: string;
    firstName?: string;
    lastName?: string;
    pendingGuardianship?: boolean;
}

const schema = new Schema<IUser>({
    internalID: String,
    email: String,
    userIdentifier: String,
    consentID: String,
    url: String,
    legalGuardian: String,
    firstName: String,
    lastName: String,
    pendingGuardianship: { type: Boolean, default: false },
});

const User = connection.model('user', schema);

export { IUser, User };
