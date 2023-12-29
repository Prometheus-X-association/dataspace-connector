import { ContextFetcher } from "json-odrl-manager";
import { Logger } from "../libs/loggers/Logger";
import { capitalize } from "../functions/string.functions";
import axios, { AxiosResponse } from "axios";
import { replaceUrlParams } from "./utils";
import { FetchingRequest } from "./FetchingRequest";

export class PolicyFetcher extends ContextFetcher {
    private configuration: any;

    constructor(configuration: any) {
        super();
        this.configuration = configuration;
        this.configureMethods();
    }

    private async requestLeftOperand(
        url: string,
        method: string,
        data?: any
    ): Promise<AxiosResponse<any, any>> {
        const headers = {
            Accept: "application/json",
        };
        const updatedUrl = replaceUrlParams(url, {});
        if (method.toLowerCase() === "post") {
            return await axios.post(updatedUrl, data, { headers });
        } else {
            return await axios.get(updatedUrl, { headers });
        }
    }

    private async processLeftOperand(
        // config: LeftOperandFetchConfig
        request: FetchingRequest
    ): Promise<unknown> {
        try {
            const { config } = request;
            const response = await this.requestLeftOperand(
                config.url,
                config.method || "get",
                config.data
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
                    (this as any)[methodToOverride] = async (
                        request: FetchingRequest
                    ): Promise<unknown> => {
                        request.config = methodConfig;
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
