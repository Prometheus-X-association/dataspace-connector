import { Schema, connection } from 'mongoose';

interface ILeftOperand {
    contractId: string;
    resourceId: string;
    name: string;
    value: string;
    schema_version: string;
}

const schema = new Schema<ILeftOperand>(
    {
        contractId: { type: String },
        resourceId: { type: String },
        name: { type: String },
        value: { type: String },
    },
    { timestamps: true }
);

const LeftOperand = connection.model<ILeftOperand>('leftoperand', schema);

export { ILeftOperand, LeftOperand };
