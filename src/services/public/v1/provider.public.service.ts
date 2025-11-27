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
import {checksum} from "../../../functions/checksum.function";
import {getEndpoint} from "../../../libs/loaders/configuration";

interface IProviderExportServiceOptions {
    infrastructureConfigurationId?: string;
}

/**
 * Provider Export Service
 * @param consumerDataExchange
 * @param options
 * @constructor
 */
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
        const {
            success: pep,
            contractID,
            resourceID,
        } = await pepVerification({
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
                    let contentLength = 0;
                    if (
                        !endpointData?.representation?.url.match(
                            Regexes.urlParams
                        )
                    ) {
                        switch (endpointData?.representation?.type) {
                            case 'REST': {
                                const [getProviderData, responseHeaders] = await handle(
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
                                        proxy: endpointData?.representation
                                        ?.proxy,
                                        dataExchange,
                                        mimeType: endpointData?.representation
                                            ?.mimeType,
                                    })
                                );

                                data = getProviderData;
                                contentLength = responseHeaders["content-length"];

                                if(!endpointData?.representation?.mimeType){
                                    Logger.info({
                                        message: `No mimetype defined for ${resourceSD} in catalog, defaulting to application/json`,
                                        location: 'ProviderExportService',
                                    });
                                }

                                if(endpointData?.representation?.mimeType && !responseHeaders["content-type"].includes(endpointData?.representation?.mimeType) ) {
                                    throw new Error(`Mimetype validation failed for ${resourceSD}, expected: ${endpointData?.representation?.mimeType}, got: ${responseHeaders["content-type"]} from representation url`);
                                }

                                if(!endpointData?.representation?.mimeType.includes("application/json")) {
                                    await dataExchange.updateProviderData({
                                        mimeType: endpointData?.representation?.mimeType,
                                        checksum: checksum(data),
                                        size: responseHeaders["content-length"],
                                    });
                                }
                                break;
                            }
                        }
                    }

                    if (!data) {
                        await dataExchange.updateStatus(
                            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                            'No data found',
                            await getEndpoint()
                        );
                    }

                    if (
                        dataExchange.serviceChain &&
                        dataExchange.serviceChain.services.length > 0
                    ) {
                        await triggerInfrastructureFlowService(
                            dataExchange.serviceChain,
                            dataExchange,
                            data
                        );
                    } else {
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
                            contentLength
                        }Bytes`,
                        location: 'ProviderExportService',
                    });
                }
            }

            return true;
        } else {
            await dataExchange.updateStatus(
                DataExchangeStatusEnum.PEP_ERROR,
                "The policies can't be verified",
                await getEndpoint()
            );
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        await dataExchange.updateStatus(
            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
            e.message,
            await getEndpoint()
        );
    }
};

/**
 * Trigger the generic flow to send data to consumer endpoint
 * @param props
 */
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
                props.endpointData?.apiResponseRepresentation,
                props.dataExchange.providerData.mimetype
            )
        );

        if (consumerImportRes) {
            const names = await pepLeftOperandsVerification({
                targetResource: props.serviceOffering,
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
