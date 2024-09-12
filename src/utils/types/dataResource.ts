import { IDataRepresentation } from './dataRepresentation';

export interface IDataResource {
    representation?: IDataRepresentation;
    apiResponseRepresentation?: IDataRepresentation;
    createdAt?: Date;
    updatedAt?: Date;
}
