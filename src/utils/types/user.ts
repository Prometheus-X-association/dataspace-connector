import { connection, Schema } from "mongoose";
import { CredentialTypeEnum } from "../enums/credentialTypeEnum";

interface IUser {
    userId: string;
    email: string;
    userIdentifier?: string;
}

const schema = new Schema({
    userId: String,
    email: String,
    userIdentifier: String,
});

const User = connection.model("user", schema);

export { IUser, User };
