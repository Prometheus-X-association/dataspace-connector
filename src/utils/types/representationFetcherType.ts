import { IDataExchange } from './dataExchange';
import {IProxyRepresentation} from "./proxyRepresentation";

export type postOrPutPayloadType = {
    resource?: string;
    representationUrl: string;
    data: any;
    method: string;
    verb?: string;
    credential?: string;
    user?: string;
    decryptedConsent?: any;
    dataExchange?: IDataExchange;
    chainId?: string;
    nextTargetId?: string;
    previousTargetId?: string;
    nextNodeResolver?: string;
    targetId?: string;
    representationQueryParams?: string[];
    proxy?: IProxyRepresentation;
};

export type getPayloadType = {
    mimeType?: any;
    resource?: any;
    method: string;
    endpoint: string;
    credential: string;
    decryptedConsent?: any;
    representationQueryParams?: string[];
    dataExchange?: IDataExchange;
    chainId?: string;
    nextTargetId?: string;
    previousTargetId?: string;
    nextNodeResolver?: string;
    targetId?: string;
    proxy?: IProxyRepresentation;
};