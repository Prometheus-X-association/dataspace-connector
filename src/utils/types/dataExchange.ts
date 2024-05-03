import { connection, Schema } from 'mongoose';
import axios from 'axios';
import { urlChecker } from '../urlChecker';
import { getEndpoint } from '../../libs/loaders/configuration';

interface IDataExchange {
    providerEndpoint: string;
    resourceId: string;
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

const schema = new Schema({
    resourceId: String,
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
            resourceId: this.resourceId,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            consumerDataExchange: this._id,
        };
    } else {
        data = {
            providerEndpoint: await getEndpoint(),
            resourceId: this.resourceId,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            providerDataExchange: this._id,
        };
    }
    await axios.post(
        urlChecker(
            participant === 'provider'
                ? this.providerEndpoint
                : this.consumerEndpoint,
            'dataexchanges'
        ),
        data
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
