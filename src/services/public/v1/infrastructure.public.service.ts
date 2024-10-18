import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import { ContractDataProcessing } from '../../../utils/types/contractDataProcessing';
import { DataExchange, IDataExchange } from '../../../utils/types/dataExchange';
import { NodeSupervisorInstance } from '../../../libs/loaders/nodeSupervisor';
import { NodeSignal } from 'dpcp-library';

export const InfastructureWebhookService = async (
    dataExchangeId: string,
    data: any
) => {
    try {
        // TODO: implement the DPCP library
        const dataExchange = await DataExchange.findById(dataExchangeId);
        console.log(dataExchange);
        return true;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};

export const triggerInfrastructureFlowService = async (
    infrastructureService: ContractDataProcessing,
    dataExchange: IDataExchange,
    data: any
) => {
    try {
        // Get the infrastructure service information
        const [participantResponse] = await handle(
            axios.get(infrastructureService.participant)
        );

        // Find the participant endpoint
        const participantEndpoint = participantResponse.dataspaceEndpoint;

        // Sync the data exchange with the infrastructure
        await dataExchange.syncWithInfrastructure(
            infrastructureService.serviceOffering,
            participantEndpoint
        );

        // library implementation
        const nodeSupervisor = NodeSupervisorInstance.getInstance();

        console.log(NodeSupervisorInstance.processingChainConfigConverter(
            dataExchange.dataProcessings
        ))

        const chainId = nodeSupervisor.createChain(
            NodeSupervisorInstance.processingChainConfigConverter(
                dataExchange.dataProcessings
            )
        );
        await nodeSupervisor.prepareChainDistribution(chainId);

        await nodeSupervisor.startChain(chainId, data);

        return true;
    } catch (error) {
        Logger.error({
            message: `Failed to trigger data exchange flow: ${error.message}`,
            location: error.stack,
        });
        throw error;
    }
};
