import { PolicyFetcher } from "./PolicyFetcher";

export type FetchConfig = {
    url: string;
    method?: string;
    data?: any;
    remoteValue?: any;
};

export class FetchingRequest {
    public params?: any;
    public config: FetchConfig;
    private fetcher: PolicyFetcher;
    constructor(fetcher: PolicyFetcher, option?: any) {
        this.fetcher = fetcher;
        this.params = option?.params;
    }
    public async fetch(leftOperand: string): Promise<unknown> {
        return this.fetcher.context[leftOperand](this);
    }
}
