import { connection, Schema } from 'mongoose';
import axios from 'axios';
import { urlChecker } from '../urlChecker';
import { getEndpoint } from '../../libs/loaders/configuration';
import { ObjectId } from 'mongodb';
import { handle } from '../../libs/loaders/handler';
import { ContractServiceChain } from './contractServiceChain';

interface IData {
    serviceOffering?: string;
    resource: string;
    params?: IParams;
    completed: boolean;
}

export interface IQueryParams {
    [key: string]: string | number | any;
}

export interface IParams {
    query: [IQueryParams];
}

export interface IService {
    participant: string;
    service: string;
    configuration: string;
    params: any;
    completed?: boolean;
}

export interface IServiceChain {
    catalogId: string;
    services: IService[];
}

interface IDataExchange {
    _id: ObjectId;
    providerEndpoint: string;
    resources: [IData];
    purposes: [IData];
    purposeId?: string;
    contract: string;
    consumerEndpoint?: string;
    consumerDataExchange?: string;
    providerDataExchange?: string;
    status: string;
    consentId?: string;
    createdAt: string;
    updatedAt?: string;
    payload?: string;
    providerParams?: IParams;
    consumerParams?: IParams;
    serviceChain?: ContractServiceChain;
    serviceChainParams?: [IData];

    // Define method signatures
    createDataExchangeToOtherParticipant(
        participant: 'provider' | 'consumer'
    ): Promise<void>;
    syncWithParticipant(): Promise<void>;
    updateStatus(status: string, payload?: any): Promise<IDataExchange>;
    syncWithInfrastructure(
        service: string,
        infrastructureEndpoint?: string
    ): Promise<IDataExchange>;
    completeServiceChain(serviceOffering: string): Promise<void>;
}

const paramsSchema = new Schema(
    {
        query: [{ type: Schema.Types.Mixed, required: true }],
    },
    { _id: false }
);

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

const dataSchema = new Schema(
    {
        serviceOffering: String,
        resource: String,
        params: paramsSchema,
    },
    {
        _id: false,
    }
);

const schema = new Schema({
    resources: [dataSchema],
    purposes: [dataSchema],
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
    consentId: String,
    providerParams: {
        query: [{ type: Schema.Types.Mixed, required: true }],
    },
    consumerParams: {
        query: [{ type: Schema.Types.Mixed, required: true }],
    },
    serviceChainParams: [dataSchema],
    serviceChain: {
        catalogId: String,
        services: [
            {
                participant: String,
                service: String,
                configuration: String,
                params: { type: Schema.Types.Mixed },
                pre: [{ type: Schema.Types.Mixed }],
                completed: { type: Boolean, default: false },
            },
        ],
    },
});

/**
 * Create the data exchange to the other participant PDC
 * @param participant The participant
 */
schema.methods.createDataExchangeToOtherParticipant = async function (
    participant: 'provider' | 'consumer'
) {
    let data;
    if (participant === 'provider') {
        data = {
            consumerEndpoint: await getEndpoint(),
            resources: this.resources,
            purposes: this.purposes,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            consentId: this.consentId,
            providerParams: this.providerParams,
            consumerParams: this.consumerParams,
            serviceChainParams: this.serviceChainParams,
            consumerDataExchange: this._id,
            serviceChain: this.serviceChain,
        };
    } else {
        data = {
            providerEndpoint: await getEndpoint(),
            resources: this.resources,
            purposes: this.purposes,
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            consentId: this.consentId,
            providerParams: this.providerParams,
            consumerParams: this.consumerParams,
            serviceChainParams: this.serviceChainParams,
            providerDataExchange: this._id,
            serviceChain: this.serviceChain,
        };
    }
    const response = await axios.post(
        urlChecker(
            participant === 'provider'
                ? this.providerEndpoint
                : this.consumerEndpoint,
            'dataexchanges'
        ),
        data
    );

    if (participant === 'provider') {
        this.providerDataExchange = response.data.content._id;
    } else {
        this.consumerDataExchange = response.data.content._id;
    }
    this.save();
};

/**
 * Sync the data exchange with the participant
 */
schema.methods.syncWithParticipant = async function () {
    let data;
    if (this.consumerDataExchange && this.providerDataExchange) return;

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

/**
 * Sync the data exchange with the infrastructure
 * @param infrastructureEndpoint The infrastructure endpoint, if not provided, the participant endpoint will be requested
 */
schema.methods.syncWithInfrastructure = async function (
    infrastructureEndpoint?: string
) {
    if (!this.providerDataExchange) this.providerDataExchange = this._id;
    if (!this.consumerDataExchange) this.consumerDataExchange = this._id;
    if (!this.providerEndpoint) this.providerEndpoint = await getEndpoint();
    if (!this.consumerEndpoint) this.consumerEndpoint = this._id;

    const [response] = await handle(
        axios.post(urlChecker(infrastructureEndpoint, 'dataexchanges'), {
            providerParams: this.providerParams,
            serviceChain: this.serviceChain,
            consumerParams: this.consumerParams,
            serviceChainParams: this.serviceChainParams,
            resources: this.resources,
            purposes: this.purposes,
            purposeId: this.purposeId,
            contract: this.contract,
            consumerEndpoint: this.consumerEndpoint,
            status: this.status,
            consentId: this.consentId,
            consumerDataExchange: this.consumerDataExchange,
            providerDataExchange: this.providerDataExchange,
            providerEndpoint: this.providerEndpoint,
        })
    );

    if (response.content._id) {
        return response.content;
    } else {
        throw new Error('Failed to sync with infrastructure');
    }
};

/**
 * Update the status of the data exchange
 * @param status The status
 * @param payload The payload
 */
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

/**
 * Update the status of the serviceChain
 * @param service
 */
schema.methods.completeServiceChain = async function (service: string) {
    const indexToUpdate = this.serviceChain.services.findIndex(
        (element: IService) => element.service === service
    );

    if (indexToUpdate === -1) {
        throw new Error('Failed to sync');
    } else {
        this.serviceChain.services[indexToUpdate].completed = true;

        if (this.consumerEndpoint && this.consumerDataExchange) {
            await axios.put(
                urlChecker(
                    this?.consumerEndpoint,
                    `dataexchanges/${this?.consumerDataExchange}/servicechains/${indexToUpdate}`
                ),
                {
                    serviceChain: this.serviceChain,
                }
            );
        }

        if (this.providerEndpoint && this.providerDataExchange) {
            await axios.put(
                urlChecker(
                    this?.providerEndpoint,
                    `dataexchanges/${this?.providerDataExchange}/servicechains/${indexToUpdate}`
                ),
                {
                    serviceChain: this.serviceChain,
                }
            );
        }

        this.save();
    }
};

type IDataExchangeModel = Document & IDataExchange & IDataExchangeMethods;

const DataExchange = connection.model<IDataExchangeModel>(
    'dataexchange',
    schema
);

export { IData, IDataExchange, DataExchange };
