import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import { ContractServiceChain } from '../../../utils/types/contractServiceChain';
import { IDataExchange } from '../../../utils/types/dataExchange';
import { NodeConfig } from 'dpcp-library';
import { SupervisorContainer } from '../../../libs/loaders/nodeSupervisor';
import { getAppKey, getEndpoint } from '../../../libs/loaders/configuration';

/**
 * Trigger Infrastructure Flow Service
 * @param serviceChain
 * @param dataExchange
 * @param data
 * @param signedConsent
 * @param encrypted
 */
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

        for (const [index, service] of serviceChain.services.entries()) {
            // Get the infrastructure service information
            const [participantResponse] = await handle(
                axios.get(service.participant)
            );

            // Find the participant endpoint
            const participantEndpoint = participantResponse.dataspaceEndpoint;

            if (participantEndpoint === (await getEndpoint()) && index === 0) {
                chainConfig.push({
                    services: [],
                    location: 'local',
                    monitoringHost: await getEndpoint(),
                    chainId: '',
                });
            } else {
                chainConfig.push(
                    ...(await nodeSupervisor.processingChainConfigConverter({
                        serviceChain: service,
                        participantEndpoint: participantEndpoint,
                        participantName: participantResponse.name,
                        participantCatalogId: participantResponse._id,
                        dataExchange:
                            dataExchange?._id.toString() ??
                            dataExchange.consumerDataExchange,
                        signedConsent: signedConsent,
                        encrypted: encrypted,
                        isLast: index === serviceChain.services.length - 1,
                    }))
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
