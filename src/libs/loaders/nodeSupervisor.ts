import {
    broadcastSetupCallback,
    BrodcastMessage,
    BSCPayload,
    CallbackPayload,
    ChainConfig,
    NodeSupervisor,
    remoteServiceCallback,
    RSCPayload,
} from 'dpcp-library';
import { IDataProcessing } from '../../utils/types/dataExchange';
import { getConfigFile } from './configuration';

export class NodeSupervisorInstance {
    private static instance: NodeSupervisor | null = null;

    private constructor() {}

    public static getInstance(): NodeSupervisor {
        if (!NodeSupervisorInstance.instance) {
            NodeSupervisorInstance.instance = new NodeSupervisor();
        }

        return NodeSupervisorInstance.instance;
    }

    public static setUp() {
        NodeSupervisorInstance.instance = new NodeSupervisor();
        NodeSupervisorInstance.instance.setBroadcastSetupCallback(
            async (message: BrodcastMessage): Promise<void> => {
                const payload: BSCPayload = {
                    message,
                    hostResolver: () => getConfigFile().endpoint,
                    path: '/node/setup',
                };
                await broadcastSetupCallback(payload);
            }
        );

        NodeSupervisorInstance.instance.setRemoteServiceCallback(
            async (cbPayload: CallbackPayload): Promise<void> => {
                const payload: RSCPayload = {
                    cbPayload,
                    hostResolver: () => getConfigFile().endpoint,
                    path: '/node/run',
                };
                await remoteServiceCallback(payload);
            }
        );

        NodeSupervisorInstance.instance.setUid(getConfigFile().endpoint);
    }

    public static processingChainConfigConverter(
        dataProcessings: IDataProcessing[]
    ): ChainConfig {
        const chainConfig: ChainConfig = [];
        dataProcessings.forEach((processing: IDataProcessing) => {
            chainConfig.push({
                services: [processing.serviceOffering],
                location: 'remote',
            });
        });
        return chainConfig;
    }
}
