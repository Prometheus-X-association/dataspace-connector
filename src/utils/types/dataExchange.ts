import mongoose, { connection, Schema } from "mongoose";

interface IDataExchange {
    providerEndpoint: string;
    resourceId: string;
    consumerEndpoint?: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    payload?: string;
}

const schema = new Schema({
    providerEndpoint: String,
    resourceId: String,
    consumerEndpoint: String,
    status: String,
    createdAt: Date,
    updatedAt: Date,
    payload: String,
});

const DataExchange = connection.model("dataexchange", schema);

export { IDataExchange, DataExchange };
