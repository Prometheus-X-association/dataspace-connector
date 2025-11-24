import {
    CallbackPayload,
    ChainConfig,
    NodeSignal,
    NodeSupervisor,
    PipelineMeta,
    PipelineProcessor,
    Ext,
    SupervisorPayloadDeployChain,
    SupervisorPayloadSetup,
    PipelineData,
} from 'dpcp-library';
import { Logger } from '../loggers';
import {
    nodeCallbackService,
    nodePreCallbackService,
} from '../../services/public/v1/node.public.service';
import { Service } from '../../utils/types/contractServiceChain';
import { handle } from './handler';
import axios from 'axios';
import { IncomingHttpHeaders } from "node:http";
import { verifyPayloadServiceChain } from "../../utils/validation/payloadValidation";

export class SupervisorContainer {
    private static instance: SupervisorContainer;
    private nodeSupervisor: NodeSupervisor;
    private uid: string;

    private constructor(uid: string) {
        this.uid = uid;
        this.nodeSupervisor = NodeSupervisor.retrieveService();
    }

    public static async getInstance(uid: string): Promise<SupervisorContainer> {
        if (!SupervisorContainer.instance) {
            SupervisorContainer.instance = new SupervisorContainer(uid);
            await SupervisorContainer.instance.setup();
        }
        return SupervisorContainer.instance;
    }

    public async createAndStartChain(
        config: ChainConfig,
        data: any
    ): Promise<void> {
        try {
            const chainId = await this.nodeSupervisor.handleRequest({
                signal: NodeSignal.CHAIN_DEPLOY,
                config,
                data,
            } as SupervisorPayloadDeployChain);
            Logger.info({
                message: `Chain created and started successfully: ${chainId}`,
            });
        } catch (err) {
            const error = err as Error;
            Logger.error({
                message: `Error creating and starting chain: ${error.message}`,
            });
            Logger.error({
                message: 'Internal server error',
            });
        }
    }

    public async communicateNode(props: {
        chainId: string;
        communicationType: string;
        remoteConfigs?: any;
        signal?: string;
        reqHeaders?: IncomingHttpHeaders;
    }): Promise<void> {
        const { chainId, communicationType, remoteConfigs, signal, reqHeaders } = props;
        try {
            switch (communicationType) {
                case 'setup': {
                    const nodeId = await this.nodeSupervisor.handleRequest({
                        signal: NodeSignal.NODE_SETUP,
                        config: { ...remoteConfigs, chainId },
                    } as SupervisorPayloadSetup);
                    Logger.info({
                        message: `Node setup successful: ${nodeId}`,
                    });
                    break;
                }
                case 'run':
                    await verifyPayloadServiceChain(remoteConfigs, reqHeaders)

                    await this.nodeSupervisor.runNodeByRelation(
                        remoteConfigs as unknown as CallbackPayload
                    );
                    Logger.info({
                        message: 'Data received and processed successfully',
                    });
                    break;
                case 'notify': {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.nodeSupervisor.handleNotification(chainId, signal);
                    break;
                }
                default:
                    Logger.error({
                        message: 'Invalid communication type',
                    });
                    return;
            }
        } catch (err) {
            const error = err as Error;
            Logger.error({
                message: `Error in node communication (${communicationType}): ${error.message}`,
            });
        }
    }

    public async setup(): Promise<void> {
        PipelineProcessor.setCallbackService(
            async ({
                targetId,
                data,
                meta,
                chainId,
                nextTargetId,
                previousTargetId,
                nextNodeResolver,
            }) => {
                Logger.info({
                    message: `PipelineProcessor callback invoked - Connector: ${
                        this.uid
                    }, Target: ${targetId}, Data size: ${
                        JSON.stringify(data).length
                    } bytes`,
                });

                return await nodeCallbackService({
                    targetId,
                    data,
                    meta,
                    chainId,
                    nextTargetId,
                    previousTargetId,
                    nextNodeResolver,
                });
            }
        );

        PipelineProcessor.setPreCallbackService(
            async ({
                targetId,
                data,
                meta,
                chainId,
                nextTargetId,
                previousTargetId,
                nextNodeResolver,
            }): Promise<PipelineData> => {
                Logger.info({
                    message: `PipelineProcessor pre callback invoked - Connector: ${
                        this.uid
                    }, Target: ${targetId}, Data size: ${
                        JSON.stringify(data).length
                    } bytes`,
                });
                return await nodePreCallbackService({
                    targetId,
                    data,
                    meta,
                    chainId,
                    nextTargetId,
                    previousTargetId,
                    nextNodeResolver,
                });
            }
        );

        await Ext.Resolver.setResolverCallbacks({
            paths: {
                pre: '/service-chain/node/pre',
                setup: '/service-chain/node/setup',
                run: '/service-chain/node/run',
            },
            hostResolver: (targetId: string, meta?: PipelineMeta) => {
                Logger.info({
                    message: `Resolving host for ${targetId}, meta: ${JSON.stringify(
                        meta,
                        null,
                        2
                    )}`,
                });
                if (meta?.resolver !== undefined) {
                    return meta.resolver;
                }
                const url = new URL(targetId);
                const baseUrl = `${url.protocol}//${url.hostname}${
                    url.port ? ':' + url.port : ''
                }`;
                return baseUrl;
            },
        });

        await Ext.Reporting.setMonitoringCallbacks({
            paths: {
                notify: '/service-chain/node/notify',
            },
        });

        try {
            this.nodeSupervisor.setUid(this.uid);
        } catch (error) {
            Logger.error({
                message: `Failed to set node supervisor UID: ${
                    (error as Error).message
                }`,
            });
            throw error;
        }
    }

    public async processingChainConfigConverter(props: {
        serviceChain: Service;
        participantEndpoint: string;
        participantName: string;
        participantCatalogId: string;
        dataExchange?: string;
        signedConsent?: any;
        encrypted?: any;
        isLast: boolean;
    }): Promise<ChainConfig> {
        const {
            serviceChain,
            participantEndpoint,
            participantName,
            participantCatalogId,
            dataExchange,
            signedConsent,
            encrypted,
            isLast,
        } = props;
        const chainConfig: ChainConfig = [];

        chainConfig.push({
            chainId: '',
            services: [
                {
                    targetId: serviceChain.service,
                    meta: {
                        resolver: participantEndpoint,
                        configuration: {
                            params: { ...serviceChain.params },
                            infrastructureConfiguration:
                                serviceChain.configuration,
                            participantName,
                            participantCatalogId,
                            participantEndpoint,
                            dataExchange,
                            signedConsent,
                            encrypted,
                        },
                    },
                },
            ],
            location: 'remote',
            ...(isLast ? {} : { signalQueue: ['node_suspend'] }),
            pre: await this.processPreChainConverter(
                serviceChain.pre,
                dataExchange,
                signedConsent,
                encrypted
            ),
        });
        return chainConfig;
    }

    public async processPreChainConverter(
        pre: any[],
        dataExchange?: string,
        signedConsent?: any,
        encrypted?: any
    ): Promise<
        {
            chainId: string;
            location: string;
            services: {
                targetId: any;
                meta: {
                    resolver: string;
                    configuration: {
                        signedConsent: any;
                        encrypted: any;
                        infrastructureConfiguration: any;
                        dataExchange: string;
                        participantEndpoint: string;
                        participantCatalogId: any;
                        params: any;
                        participantName: any;
                    };
                };
            }[];
        }[][]
    > {
        const finalArray = [];

        for (const chain of pre) {
            const subArray = [];
            for (const service of chain) {
                const [participantResponse] = await handle(
                    axios.get(service.participant)
                );
                const participantEndpoint =
                    participantResponse.dataspaceEndpoint;
                subArray.push({
                    chainId: '',
                    services: [
                        {
                            targetId: service.service,
                            meta: {
                                resolver: participantEndpoint,
                                configuration: {
                                    params: { ...service.params },
                                    infrastructureConfiguration:
                                        service.configuration,
                                    participantName: participantResponse.name,
                                    participantCatalogId:
                                        participantResponse._id,
                                    participantEndpoint,
                                    dataExchange,
                                    signedConsent,
                                    encrypted,
                                },
                            },
                        },
                    ],
                    location: 'remote',
                });
            }
            finalArray.push(subArray);
        }
        return finalArray;
    }
}
