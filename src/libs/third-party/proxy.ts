import {HttpsProxyAgent} from "https-proxy-agent";
import {HttpProxyAgent} from "http-proxy-agent";
import {Logger} from "../loggers";
import {DataExchange, IDataExchange} from "../../utils/types/dataExchange";
import {getProxy} from "../loaders/configuration";

interface AxiosProxyConfig {
    host: string;
    port: number;
    protocol: string;
    username?: string;
    password?: string;
}

/**
 * Checks if the participant has a proxy configured for their data space connector and returns the appropriate agents for HTTP and HTTPS requests.
 * @param props
 */
export const checkConnectorProxy = async (
    props:{
        dataExchangeId?: string,
        endpoint?: string,
        configProxy?: {
            host: string;
            port: number;
            protocol: string;
            username?: string;
            password?: string;
        }
    }
    ): Promise<Object> => {
    try {

        let proxyConfig: AxiosProxyConfig | null = null;

        if(props?.configProxy && props?.configProxy?.host && props?.configProxy?.port && props?.configProxy?.protocol) {
            proxyConfig = props?.configProxy as AxiosProxyConfig;
        } else if (props?.dataExchangeId && props?.endpoint) {
            const dataExchange = await DataExchange.findById(props?.dataExchangeId).lean();
            
            if(!dataExchange) {
                Logger.error({
                    message: `Data exchange with id ${props?.dataExchangeId} not found.`,
                });
                new Error(`Data exchange with id ${props?.dataExchangeId} not found.`);
            }
            
            if(dataExchange?.providerEndpoint === props?.endpoint) {
                proxyConfig = dataExchange?.providerProxy as AxiosProxyConfig;
            } else if (dataExchange?.consumerEndpoint === props?.endpoint) {
                proxyConfig = dataExchange?.consumerProxy as AxiosProxyConfig;
            } else {
                Logger.error({
                    message: `Endpoint ${props?.endpoint} does not match provider or consumer endpoint of data exchange ${props?.dataExchangeId}.`,
                });
                new Error(`Endpoint ${props?.endpoint} does not match provider or consumer endpoint of data exchange ${props?.dataExchangeId}.`);
            }
        }

        if (proxyConfig && proxyConfig.host && proxyConfig.port && proxyConfig.protocol) {
            const buildProxyUrl = (axiosProxy: AxiosProxyConfig): string => {
                const protocol = axiosProxy.protocol;
                const auth = axiosProxy.username && axiosProxy.password
                    ? `${encodeURIComponent(axiosProxy.username)}:${encodeURIComponent(
                        axiosProxy.password
                    )}@`
                    : '';
                return `${protocol}://${auth}${axiosProxy.host}:${axiosProxy.port}`;
            };

            const proxyUrl = buildProxyUrl({
                host: proxyConfig.host?.toString(),
                port: Number(proxyConfig.port),
                protocol: proxyConfig.protocol?.toString(),
                username: proxyConfig.username?.toString(),
                password: proxyConfig.password?.toString(),
            });

            const httpsAgent = new HttpsProxyAgent(proxyUrl, {
                rejectUnauthorized: false,
                keepAlive: false,
                timeout: 20000,
            });

            const httpAgent = new HttpProxyAgent(proxyUrl, {
                keepAlive: false,
                timeout: 20000,
            });

            return { rejectUnauthorized: false, proxy: false, httpsAgent, httpAgent };
        } else {
            return {
                rejectUnauthorized: false
            };
        }
    } catch (e) {
        Logger.error({
            message: e.toString(),
        });
        return {};
    }
}
