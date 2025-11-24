import {PipelineMeta} from "dpcp-library";

export type CallbackMeta = PipelineMeta & {
    configuration: {
        dataExchange: string;
        signedConsent: string;
        encrypted: string;
        params: unknown;
    };
};