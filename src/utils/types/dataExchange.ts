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
}

interface IQueryParams {
    [key: string]: string | number | any;
}

interface IParams {
    query: [IQueryParams];
}

export interface IDataProcessing {
    serviceOffering: string;
    participant: string;
    completed: boolean;
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
    dataProcessings?: IDataProcessing[];

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
    completeDataProcessing(
        serviceOffering: string,
        participant: string
    ): Promise<void>;
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
    dataProcessings: [
        {
            serviceOffering: String,
            participant: String,
            completed: Boolean,
        },
    ],
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

/**
 * Sync the data exchange with the participant
 * @param participant The participant
 */
schema.methods.syncWithParticipant = async function (
    participant: 'provider' | 'consumer'
) {
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

/**
 * Sync the data exchange with the infrastructure
 * @param infrastructureService The infrastructure service
 * @param infrastructureEndpoint The infrastructure endpoint, if not provided, the participant endpoint will be requested
 */
schema.methods.syncWithInfrastructure = async function (
    infrastructureService: string,
    infrastructureEndpoint?: string
) {
    console.log('this.dataProcessing', this.dataProcessings);
    console.log('infrastructureService', infrastructureService);
    const dataProcessing = this.dataProcessings.find(
        (element: IDataProcessing) =>
            !element.completed &&
            element.serviceOffering === infrastructureService
    );

    console.log('dataProcessing', infrastructureEndpoint);

    if (dataProcessing) {
        if (!infrastructureEndpoint) {
            const [participantResponse] = await handle(
                axios.get(dataProcessing.participant)
            );
            infrastructureEndpoint = participantResponse?.dataspaceEndpoint;
        }

        const [response] = await handle(
            axios.post(
                urlChecker(infrastructureEndpoint, 'dataexchanges'),
                this
            )
        );

        console.log('response', response);

        if (response.content._id) {
            return response;
        } else {
            throw new Error('Failed to sync with infrastructure');
        }
    }
};

/**
 * Complete the data processing
 * @param serviceOffering The service offering
 * @param participant The participant
 */
schema.methods.completeDataProcessing = async function (
    serviceOffering: string,
    participant: string
) {
    const dataProcessing = this.dataProcessings.find(
        (element: IDataProcessing) =>
            element.serviceOffering === serviceOffering &&
            element.participant === participant
    );
    if (dataProcessing) {
        dataProcessing.completed = true;
        await this.save();
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

const DataExchange = connection.model<IDataExchange>('dataexchange', schema);

export { IDataExchange, DataExchange, IParams, IData, IQueryParams };
