import { connection, Schema } from 'mongoose';
import axios from 'axios';
import { urlChecker } from '../urlChecker';
import { getEndpoint } from '../../libs/loaders/configuration';
import { ObjectId } from 'mongodb';
import { handle } from '../../libs/loaders/handler';

interface IData {
    serviceOffering?: string;
    resource: string;
    params?: IParams;
    completed: boolean;
}

interface IQueryParams {
    [key: string]: string | number | any;
}

interface IParams {
    query: [IQueryParams];
}

export interface IInfrastructureService {
    participant: string;
    serviceOffering: string;
    configuration: string;
    params: any;
    completed?: boolean;
}

export interface IDataProcessing {
    _id: string;
    dataProviderService: string;
    dataConsumerService: string;
    infrastructureServices: IInfrastructureService[];
}

interface IDataExchange {
    _id: ObjectId;
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
    dataProcessing?: IDataProcessing;

    // Define method signatures
    createDataExchangeToOtherParticipant(
        participant: 'provider' | 'consumer'
    ): Promise<void>;
    syncWithParticipant(): Promise<void>;
    syncWithInfrastructure(
        infrastructureService: string,
        infrastructureEndpoint?: string
    ): Promise<IDataExchange>;
    updateStatus(status: string, payload?: any): Promise<void>;
    completeDataProcessing(serviceOffering: string): Promise<void>;
}

const paramsSchema = new Schema({
    query: [{ type: Schema.Types.Mixed, required: true }],
});

const dataSchema = new Schema({
    serviceOffering: String,
    resource: String,
    params: paramsSchema,
});

const schema = new Schema({
    resources: [dataSchema],
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
    dataProcessing: {
        infrastructureServices: [
            {
                participant: String,
                serviceOffering: String,
                configuration: String,
                params: { type: Schema.Types.Mixed },
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
            purposeId: this.purposeId,
            contract: this.contract,
            status: this.status,
            providerParams: this.providerParams,
            consumerDataExchange: this._id,
            dataProcessing: this.dataProcessing,
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
            dataProcessing: this.dataProcessing,
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
    this.providerDataExchange = this._id;
    this.providerEndpoint = await getEndpoint();

    const [response] = await handle(
        axios.post(urlChecker(infrastructureEndpoint, 'dataexchanges'), {
            providerParams: this.providerParams,
            dataProcessing: this.dataProcessing,
            resources: this.resources,
            purposeId: this.purposeId,
            contract: this.contract,
            consumerEndpoint: this.consumerEndpoint,
            status: this.status,
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
    this.save();
};

/**
 * Update the status of the dataProcessing
 * @param serviceOffering
 */
schema.methods.completeDataProcessing = async function (
    serviceOffering: string
) {
    const indexToUpdate = this.dataProcessing.infrastructureServices.findIndex(
        (element: IInfrastructureService) =>
            element.serviceOffering === serviceOffering
    );

    if (indexToUpdate === -1) {
        throw new Error('Failed to sync');
    } else {
        this.dataProcessing.infrastructureServices[indexToUpdate].completed =
            true;

        if (this.consumerEndpoint && this.consumerDataExchange) {
            await axios.put(
                urlChecker(
                    this?.consumerEndpoint,
                    `dataexchanges/${this?.consumerDataExchange}/dataprocessings/${indexToUpdate}`
                ),
                {
                    dataProcessing: this.dataProcessing,
                }
            );
        }

        if (this.providerEndpoint && this.providerDataExchange) {
            await axios.put(
                urlChecker(
                    this?.providerEndpoint,
                    `dataexchanges/${this?.providerDataExchange}/dataprocessings/${indexToUpdate}`
                ),
                {
                    dataProcessing: this.dataProcessing,
                }
            );
        }

        this.save();
    }
};

const DataExchange = connection.model<IDataExchange>('dataexchange', schema);

export { IDataExchange, DataExchange, IParams, IData, IQueryParams };
