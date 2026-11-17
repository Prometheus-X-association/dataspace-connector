import {handle} from "../libs/loaders/handler";
import axios from "axios";
import {checkConnectorProxy} from "../libs/third-party/proxy";
import {getEndpoint, getProxy} from "../libs/loaders/configuration";

export const synchronizeServiceChain = async (
    dataExchange: any,
    serviceChainId: string | undefined
) => {
    if (serviceChainId && dataExchange.serviceChain.services.length > 0) {
        for (const service of dataExchange.serviceChain.services) {
            // Get the infrastructure service information
            const [participantResponse] = await handle(
                axios.get(
                    service.participant,
                    await checkConnectorProxy({
                        configProxy: getProxy(),
                    })
                )
            );

            // Find the participant endpoint
            const participantEndpoint =
                participantResponse.dataspaceEndpoint;

            // Sync the data exchange with the infrastructure
            if (
                participantEndpoint !== (await getEndpoint()) &&
                participantEndpoint !== dataExchange?.consumerEndpoint &&
                participantEndpoint !== dataExchange?.providerEndpoint
            )
                await dataExchange.syncWithInfrastructure(
                    participantEndpoint
                );

            if (service.pre && service.pre.length > 0) {
                for (const prechain of service.pre) {
                    for (const element of prechain) {
                        const [participantResponse] = await handle(
                            axios.get(
                                element.participant,
                                await checkConnectorProxy({
                                    configProxy: getProxy(),
                                })
                            )
                        );

                        // Find the participant endpoint
                        const participantEndpoint =
                            participantResponse.dataspaceEndpoint;

                        if (
                            participantEndpoint !==
                            dataExchange.consumerEndpoint &&
                            participantEndpoint !== (await getEndpoint())
                        ) {
                            // Sync the data exchange with the infrastructure
                            await dataExchange.syncWithInfrastructure(
                                participantEndpoint
                            );
                        }
                    }
                }
            }
        }
    } else {
        return dataExchange;
    }
}