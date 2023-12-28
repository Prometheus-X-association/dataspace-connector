import { ContextFetcher } from "json-odrl-manager";
import { Logger } from "../libs/loggers/Logger";

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

    private processLeftOperand(config: LeftOperandFetchConfig): void {
        process.stdout.write(`${config.url}`);
    }
    private configureMethods() {
        try {
            Object.keys(this.configuration).forEach((methodName) => {
                const methodConfig = this.configuration[methodName];
                const methodToOverride = `get${methodName
                    .charAt(0)
                    .toUpperCase()}${methodName.slice(1)}`;
                if (typeof methodConfig === "object" && "url" in methodConfig) {
                    (this as any)[methodToOverride] = async () => {
                        this.processLeftOperand(methodConfig);
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
