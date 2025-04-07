import { connection, Schema } from 'mongoose';

interface IInfrastructureConfiguration {
    verb: string;
    data?: 'latestData' | 'augmentedData' | 'latestData:augmentedData';
    service: string;
    resource?: string;
}

const schema = new Schema({
    verb: { type: String },
    data: { type: String },
    service: { type: String, required: true },
    resource: { type: String },
});

const InfrastructureConfiguration = connection.model(
    'infrastructureConfiguration',
    schema
);

export { IInfrastructureConfiguration, InfrastructureConfiguration };
