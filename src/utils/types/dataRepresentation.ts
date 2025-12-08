import { IProxyRepresentation } from './proxyRepresentation';

export interface IDataRepresentation {
    type?: string;
    url?: string;
    method?: string;
    credential?: string;
    mimeType?: string;
    queryParams?: Record<string, string>;
    proxy?: IProxyRepresentation;
    createdAt?: Date;
    updatedAt?: Date;
}
