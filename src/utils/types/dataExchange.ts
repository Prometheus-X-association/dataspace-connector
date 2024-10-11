import { connection, Schema } from 'mongoose';
import axios from 'axios';
import { urlChecker } from '../urlChecker';
import { getEndpoint } from '../../libs/loaders/configuration';
import { ObjectId } from 'mongodb';

interface IData {
    serviceOffering?: string;
    resource: string;
    params?: IParams;
}

interface IQueryParams {
    [key: string]: string | number | any;
}

interface IParams {
    query: [IQueryParams];
}

interface IDataExchange {
    _id: ObjectId;
    consumerId: string;
    providerEndpoint: string;
    resources: [IData];
    purposeId?: string;
    contract: string;
    consumerEndpoint?: string;
    consumerDataExchange?: string;
    providerDataExchange?: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    payload?: string;
    providerParams?: IParams;

    // Define method signatures
    createDataExchangeToOtherParticipant(
        participant: 'provider' | 'consumer'
    ): Promise<void>;
    syncWithParticipant(): Promise<void>;
    updateStatus(status: string, payload?: any): Promise<IDataExchange>;
}

const paramsSchema = new Schema({
    query: [{ type: Schema.Types.Mixed, required: true }],
});

export type DataExchangeResult = {
    exchange: IDataExchange;
    errorMessage?: string;
} | null;

interface IDataExchangeMethods {
    createDataExchangeToOtherParticipant(
        participant: 'provider' | 'consumer'
    ): Promise<void>;
    syncWithParticipant(): Promise<void>;
    updateStatus(status: string, payload?: any): Promise<IDataExchangeModel>;
}

const dataSchema = new Schema({
    serviceOffering: String,
    resource: String,
    params: paramsSchema,
});

const schema = new Schema({
    consumerId: String,
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
    providerParams: {
        query: [{ type: Schema.Types.Mixed, required: true }],
    },
});

schema.methods.createDataExchangeToOtherParticipant = async function (
    participant: 'provider' | 'consumer'
) {
    let data;
    if (participant === 'provider') {
        data = {
            consumerEndpoint: await getEndpoint(),
            resources: this.resources,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            providerParams: this.providerParams,
            consumerDataExchange: this._id,
        };
    } else {
        data = {
            providerEndpoint: await getEndpoint(),
            resources: this.resources,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            providerParams: this.providerParams,
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
    return this.save();
};

type IDataExchangeModel = Document & IDataExchange & IDataExchangeMethods;

const DataExchange = connection.model<IDataExchangeModel>(
    'dataexchange',
    schema
);

export { IData, IDataExchange, DataExchange };
