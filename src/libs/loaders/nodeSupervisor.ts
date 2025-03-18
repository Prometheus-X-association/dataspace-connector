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
} from 'dpcp-library';
import { Logger } from '../loggers';
import { InfrastructureService } from '../../utils/types/contractDataProcessing';
import { nodeCallbackService } from '../../services/public/v1/node.public.service';

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
    }): Promise<void> {
        const { chainId, communicationType, remoteConfigs, signal } = props;
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
            async ({ targetId, data, meta }) => {
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
                });
            }
        );

        await Ext.Resolver.setResolverCallbacks({
            paths: {
                setup: '/node/communicate/setup',
                run: '/node/communicate/run',
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
                notify: '/node/communicate/notify',
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

    public processingChainConfigConverter(
        dataProcessing: InfrastructureService,
        participantEndpoint: string,
        dataExchange?: string,
        signedConsent?: any,
        encrypted?: any
    ): ChainConfig {
        const chainConfig: ChainConfig = [];
        chainConfig.push({
            chainId: '',
            services: [
                {
                    targetId: dataProcessing.serviceOffering,
                    meta: {
                        resolver: participantEndpoint,
                        configuration: {
                            params: { ...dataProcessing.params },
                            infrastructureConfiguration:
                                dataProcessing.configuration,
                            dataExchange,
                            signedConsent,
                            encrypted,
                        },
                    },
                },
            ],
            location: 'remote',
        });
        return chainConfig;
    }
}
