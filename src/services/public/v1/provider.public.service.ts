import { DataExchange, IDataExchange } from '../../../utils/types/dataExchange';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/third-party/contract';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { consumerError } from '../../../utils/consumerError';
import { Regexes } from '../../../utils/regexes';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { consumerImport } from '../../../libs/third-party/consumer';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import { Logger } from '../../../libs/loggers';
import { triggerInfrastructureFlowService } from './infrastructure.public.service';

interface IProviderExportServiceOptions {
    infrastructureConfigurationId?: string;
}

export const ProviderExportService = async (
    consumerDataExchange: string,
    options?: IProviderExportServiceOptions
) => {
    //Get the data exchange
    const dataExchange = await DataExchange.findOne({
        consumerDataExchange: consumerDataExchange,
    });

    try {
        // Get the contract
        const [contractResp] = await handle(getContract(dataExchange.contract));

        const serviceOffering = selfDescriptionProcessor(
            dataExchange.resources[0].serviceOffering,
            dataExchange,
            dataExchange.contract,
            contractResp
        );

        //PEP
        const { pep, contractID, resourceID } = await pepVerification({
            targetResource: serviceOffering,
            referenceURL: dataExchange.contract,
        });

        if (pep) {
            for (const resource of dataExchange.resources) {
                const resourceSD = resource.resource;

                // B to B exchange
                if (
                    dataExchange._id &&
                    dataExchange.consumerEndpoint &&
                    resourceSD
                ) {
                    //Call the catalog endpoint
                    const [endpointData] = await handle(
                        getCatalogData(resourceSD)
                    );

                    if (!endpointData?.representation) {
                        await consumerError(
                            dataExchange.consumerEndpoint,
                            dataExchange._id.toString(),
                            'No representation found'
                        );
                    }

                    let data;
                    if (
                        !endpointData?.representation?.url.match(
                            Regexes.urlParams
                        )
                    ) {
                        switch (endpointData?.representation?.type) {
                            case 'REST':
                                // eslint-disable-next-line no-case-declarations
                                const [getProviderData] = await handle(
                                    getRepresentation({
                                        resource: resourceSD,
                                        method: endpointData?.representation
                                            ?.method,
                                        endpoint:
                                            endpointData?.representation?.url,
                                        credential:
                                            endpointData?.representation
                                                ?.credential,
                                        representationQueryParams:
                                            endpointData?.representation
                                                ?.queryParams,
                                        dataExchange,
                                    })
                                );

                                data = getProviderData;
                                break;
                        }
                    }

                    if (!data) {
                        await dataExchange.updateStatus(
                            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                            'No date found'
                        );
                    }

                    //When the data is retrieved, check wich flow to trigger based infrastructure options
                    if (
                        dataExchange.serviceChain &&
                        dataExchange.serviceChain.services.length > 0
                    ) {
                        //Trigger the infrastructure flow

                        await triggerInfrastructureFlowService(
                            dataExchange.serviceChain,
                            dataExchange,
                            data
                        );
                    } else {
                        //Trigger the generic flow
                        await triggerGenericFlow({
                            dataExchange,
                            data,
                            serviceOffering,
                            contractID,
                            resourceID,
                            endpointData,
                        });
                    }
                    Logger.info({
                        message: `Successfully retrieve data from ${resourceSD} with size of ${
                            JSON.stringify(data).length
                        }Bytes`,
                        location: 'ProviderExportService',
                    });
                }
            }

            return true;
        } else {
            await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR);
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        await dataExchange.updateStatus(
            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
            e.message
        );
    }
};

const triggerGenericFlow = async (props: {
    dataExchange: IDataExchange;
    data: any;
    serviceOffering: string;
    contractID: string;
    resourceID: string;
    endpointData?: any;
}) => {
    try {
        //Send the data to generic endpoint
        const [consumerImportRes] = await handle(
            consumerImport(
                props.dataExchange.consumerEndpoint,
                props.dataExchange._id.toString(),
                props.data,
                props.endpointData?.apiResponseRepresentation
            )
        );

        if (consumerImportRes) {
            const names = await pepLeftOperandsVerification({
                targetResource: props.serviceOffering,
                referenceURL: props.dataExchange.contract,
            });
            await processLeftOperands(
                names,
                props.contractID,
                props.resourceID
            );
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};
