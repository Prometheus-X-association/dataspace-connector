import { ContextFetcher } from "json-odrl-manager";
import { Logger } from "../libs/loggers/Logger";
import { capitalize } from "../functions/string.functions";
import axios from "axios";

export type LeftOperandFetchConfig = {
    url: string;
    option?: any;
};
export class PolicyFetcher extends ContextFetcher {
    private configuration: any;

    constructor(configuration: any) {
        super();
        this.configuration = configuration;
        this.configureMethods();
    }

    private async processLeftOperand(
        config: LeftOperandFetchConfig
    ): Promise<unknown> {
        try {
            const response = await axios.get(config.url, {
                headers: {
                    Accept: "application/json",
                },
            });
            if (config.option && config.option.remoteValue) {
                const keys = config.option.remoteValue.split(".");
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
                            return this.processLeftOperand(methodConfig);
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
