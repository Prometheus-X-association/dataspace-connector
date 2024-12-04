import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import { ContractDataProcessing } from '../../../utils/types/contractDataProcessing';
import { IDataExchange } from '../../../utils/types/dataExchange';
import { NodeConfig } from 'dpcp-library';
import { SupervisorContainer } from '../../../libs/loaders/nodeSupervisor';
import { getAppKey, getEndpoint } from '../../../libs/loaders/configuration';

export const triggerInfrastructureFlowService = async (
    dataProcessing: ContractDataProcessing,
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

        for (const infrastructureService of dataProcessing.infrastructureServices) {
            // Get the infrastructure service information
            const [participantResponse] = await handle(
                axios.get(infrastructureService.participant)
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
                        infrastructureService,
                        participantEndpoint,
                        dataExchange?._id.toString() ??
                            dataExchange.consumerDataExchange,
                        signedConsent,
                        encrypted
                    )
                );
            }
        }

        await dataExchange.completeDataProcessing(
            dataExchange.dataProcessing.infrastructureServices[0]
                .serviceOffering
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
