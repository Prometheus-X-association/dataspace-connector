import { PolicyDataFetcher } from 'json-odrl-manager';
import { Logger } from '../libs/loggers';
import { capitalize } from '../functions/string.functions';
import axios, { AxiosResponse } from 'axios';
import { replaceUrlParams } from './utils';

export type FetchConfig = {
    url: string;
    method?: string;
    token?: string;
    data?: unknown;
    remoteValue?: string;
};

export type Params = {
    [key: string]: string | number | Date;
};

export type FetchingRequest = {
    params?: Params;
    config: FetchConfig;
};

export type FetcherConfig = {
    [key: string]: {
        url: string;
        remoteValue?: string;
    };
};

export type FetchingParams = {
    [key: string]: Params;
};

type Methods = {
    [key: string]: () => unknown;
};

export class PolicyFetcher extends PolicyDataFetcher {
    private configuration: FetcherConfig;
    private fetchingParams: FetchingParams;
    constructor(config: FetcherConfig) {
        super();
        this.configuration = config;
        this.fetchingParams = {};
        this.setBypassFor('notificationMessage');
        this.configureMethods();
    }

    public setOptionalFetchingParams(fetchingParams: FetchingParams) {
        this.fetchingParams = { ...this.fetchingParams, ...fetchingParams };
    }

    private async requestLeftOperand(
        config: FetchConfig,
        params?: Params
    ): Promise<AxiosResponse<object, unknown>> {
        try {
            const { url, method = 'get', token, data } = config;
            const headers = {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            const updatedUrl = replaceUrlParams(url, params);
            if (method.toLowerCase() === 'post') {
                return await axios.post(updatedUrl, data, { headers });
            } else {
                return await axios.get(updatedUrl, { headers });
            }
        } catch (error) {
            let message = error.message;
            if (error.response || error.request) {
                const { url, method } = error.config;
                const status = error.response
                    ? `, Status: ${error.response.status}`
                    : '';
                message += `, URL: ${url}, Method: ${method}${status}`;
            }
            Logger.error({
                message,
                location: error.stack,
            });
        }
    }

    private async processLeftOperand(
        request: FetchingRequest
    ): Promise<unknown> {
        try {
            const { config, params } = request;
            const response = await this.requestLeftOperand(config, params);
            if (config.remoteValue) {
                const keys = config.remoteValue.split('.');
                let value = response.data;
                for (const key of keys) {
                    if (value && key in value) {
                        value = value[key as keyof object];
                    } else {
                        throw new Error(
                            `Property '${key}' not found in response`
                        );
                    }
                }
                return value;
            }
            return response.data;
        } catch (error) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }

    private configureMethods(): void {
        try {
            Object.keys(this.configuration).forEach((methodName) => {
                const methodConfig = this.configuration[methodName];
                const methodToOverride = `get${capitalize(methodName)}`;
                if (typeof methodConfig === 'object' && 'url' in methodConfig) {
                    (this as unknown as Methods)[methodToOverride] =
                        async (): Promise<unknown> => {
                            const request: FetchingRequest = {
                                config: methodConfig,
                                params: this.fetchingParams
                                    ? this.fetchingParams[methodName]
                                    : {},
                            };
                            return this.processLeftOperand(request);
                        };
                    this.context[methodName] = (this as unknown as Methods)[
                        methodToOverride
                    ].bind(this);
                } else {
                    throw new Error('LeftOperand Configuration Failed');
                }
            });
        } catch (error) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }
}
