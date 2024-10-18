import { connection, Schema } from 'mongoose';

interface IInfrastructureConfiguration {
    verb: string;
    data: boolean;
    infrastructureService: string;
}

const schema = new Schema({
    verb:  { type: String },
    data:  { type: Boolean },
    infrastructureService: { type: String, required: true },
});

const InfrastructureConfiguration = connection.model('infrastructureConfiguration', schema);

export { IInfrastructureConfiguration, InfrastructureConfiguration };
