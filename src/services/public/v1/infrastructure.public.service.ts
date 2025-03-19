import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import { ContractServiceChain } from '../../../utils/types/contractServiceChain';
import { IDataExchange } from '../../../utils/types/dataExchange';
import { NodeConfig } from 'dpcp-library';
import { SupervisorContainer } from '../../../libs/loaders/nodeSupervisor';
import { getAppKey, getEndpoint } from '../../../libs/loaders/configuration';

export const triggerInfrastructureFlowService = async (
    serviceChain: ContractServiceChain,
    dataExchange: IDataExchange,
    data: any,
    signedConsent?: any,
    encrypted?: any
) => {
    try {
        // library implementation
        const nodeSupervisor = await SupervisorContainer.getInstance(
            await getAppKey()
        );

        const chainConfig: NodeConfig[] = [];

        for (const service of serviceChain.services) {
            // Get the infrastructure service information
            const [participantResponse] = await handle(
                axios.get(service.participant)
            );

            // Find the participant endpoint
            const participantEndpoint = participantResponse.dataspaceEndpoint;

            if (participantEndpoint === (await getEndpoint())) {
                chainConfig.push({
                    services: [],
                    location: 'local',
                    monitoringHost: await getEndpoint(),
                    chainId: '',
                });
            } else {
                chainConfig.push(
                    ...nodeSupervisor.processingChainConfigConverter(
                        service,
                        participantEndpoint,
                        dataExchange?._id.toString() ??
                            dataExchange.consumerDataExchange,
                        signedConsent,
                        encrypted
                    )
                );
            }
        }

        await dataExchange.completeServiceChain(
            dataExchange.serviceChain.services[0].service
        );

        await nodeSupervisor.createAndStartChain(chainConfig, data);

        return true;
    } catch (error) {
        Logger.error({
            message: `Failed to trigger data exchange flow: ${error.message}`,
            location: error.stack,
        });
        throw error;
    }
};
