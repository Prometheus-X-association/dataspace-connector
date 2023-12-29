import { ContextFetcher } from "json-odrl-manager";
import { Logger } from "../libs/loggers/Logger";
import { capitalize } from "../functions/string.functions";
import axios, { AxiosResponse } from "axios";
import { replaceUrlParams } from "./utils";

export type FetchConfig = {
    url: string;
    method?: string;
    data?: any;
    remoteValue?: any;
};

export type FetchingRequest = {
    params?: any;
    config: FetchConfig;
};

export class PolicyFetcher extends ContextFetcher {
    private configuration: any;
    private fetchingParams: any;
    constructor(config: any) {
        super();
        this.configuration = config;
        this.fetchingParams = {};
        this.configureMethods();
    }

    public setOptionalFetchingParams(fetchingParams: any) {
        this.fetchingParams = { ...this.fetchingParams, ...fetchingParams };
    }

    private async requestLeftOperand(
        url: string,
        method: string,
        data?: any,
        params?: any
    ): Promise<AxiosResponse<any, any>> {
        try {
            const headers = {
                Accept: "application/json",
            };
            const updatedUrl = replaceUrlParams(url, params);
            if (method.toLowerCase() === "post") {
                return await axios.post(updatedUrl, data, { headers });
            } else {
                return await axios.get(updatedUrl, { headers });
            }
        } catch (error: any) {
            let message = error.message;
            if (error.response) {
                message += `, URL: ${error.config.url}, Method: ${error.config.method}, Status: ${error.response.status}`;
            } else if (error.request) {
                message += `, URL: ${error.config.url}, Method: ${error.config.method}`;
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
            const response = await this.requestLeftOperand(
                config.url,
                config.method || "get",
                config.data,
                params
            );
            if (config.remoteValue) {
                const keys = config.remoteValue.split(".");
                let value = response.data;
                for (const key of keys) {
                    if (value && key in value) {
                        value = value[key];
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
                if (typeof methodConfig === "object" && "url" in methodConfig) {
                    (this as any)[methodToOverride] =
                        async (): Promise<unknown> => {
                            const request: FetchingRequest = {
                                config: methodConfig,
                                params: this.fetchingParams
                                    ? this.fetchingParams[methodName]
                                    : {},
                            };
                            return this.processLeftOperand(request);
                        };
                    this.context[methodName] = (this as any)[
                        methodToOverride
                    ].bind(this);
                } else {
                    throw new Error("LeftOperand Configuration Failed");
                }
            });
        } catch (error: any) {
            Logger.error({
                location: error.stack,
                message: error.message,
            });
        }
    }
}
