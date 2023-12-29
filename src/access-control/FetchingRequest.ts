export type FetchConfig = {
    url: string;
    method?: string;
    data?: any;
    params?: any;
    remoteValue?: any;
};

export class FetchingRequest {
    param: any;
    config: FetchConfig;
    constructor() {}
}
