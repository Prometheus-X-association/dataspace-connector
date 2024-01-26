import { connection, Schema } from 'mongoose';

interface IUser {
    _id: string;
    internalID: string;
    email: string;
    userIdentifier?: string;
}

const schema = new Schema<IUser>({
    internalID: String,
    email: String,
    userIdentifier: String,
});

const User = connection.model('user', schema);

export { IUser, User };
