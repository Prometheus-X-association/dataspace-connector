import mongoose, { connection, Schema } from 'mongoose';
import axios from 'axios';
import { urlChecker } from '../urlChecker';
import { getEndpoint } from '../../libs/loaders/configuration';
import https from 'node:https';

interface IData {
    serviceOffering: string;
    resource: string;
}

interface IDataExchange {
    providerEndpoint: string;
    resource: [IData];
    purposeId?: string;
    contract: string;
    consumerEndpoint?: string;
    consumerDataExchange?: string;
    providerDataExchange?: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    payload?: string;
}

const dataSchema = new Schema({
    serviceOffering: String,
    resource: String,
});

const schema = new Schema({
    resource: [dataSchema],
    purposeId: String,
    contract: String,
    consumerEndpoint: String,
    providerEndpoint: String,
    consumerDataExchange: String,
    providerDataExchange: String,
    status: String,
    createdAt: Date,
    updatedAt: Date,
    payload: String,
});

schema.methods.createDataExchangeToOtherParticipant = async function (
    participant: 'provider' | 'consumer'
) {
    let data;
    if (participant === 'provider') {
        data = {
            consumerEndpoint: await getEndpoint(),
            resource: this.resource,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            consumerDataExchange: this._id,
        };
    } else {
        data = {
            providerEndpoint: await getEndpoint(),
            resource: this.resource,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            providerDataExchange: this._id,
        };
    }
    console.log('ok')
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    await axios.post(
        urlChecker(
            participant === 'provider'
                ? this.providerEndpoint
                : this.consumerEndpoint,
            'dataexchanges'
        ),
        data,
        { httpsAgent: agent }
    );
};

schema.methods.syncWithParticipant = async function () {
    let data;
    if (this.consumerEndpoint && this.consumerDataExchange) {
        data = {
            providerDataExchange: this._id,
        };
    } else {
        data = {
            consumerDataExchange: this._id,
        };
    }
    await axios.put(
        urlChecker(
            this.consumerEndpoint ?? this.providerEndpoint,
            `dataexchanges/${
                this.consumerDataExchange ?? this.providerDataExchange
            }`
        ),
        data
    );
};

schema.methods.updateStatus = async function (status: string, payload?: any) {
    this.status = status;
    this.payload = payload;
    await axios.put(
        urlChecker(
            this?.consumerEndpoint ?? this?.providerEndpoint,
            `dataexchanges/${
                this?.consumerDataExchange ?? this?.providerDataExchange
            }`
        ),
        {
            status,
            payload,
        }
    );
    this.save();
};

const DataExchange = connection.model<IDataExchange>('dataexchange', schema);

export { IDataExchange, DataExchange };
