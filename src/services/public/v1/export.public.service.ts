import { consumerError } from '../../../utils/consumerError';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import { getCatalogData } from '../../../libs/services/catalog';
import { consumerImport } from '../../../libs/services/consumer';
import { Logger } from '../../../libs/loggers';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import {
    DataExchange,
    DataExchangeResult,
    IDataExchange,
} from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import { Regexes } from '../../../utils/regexes';

export const providerExportService = async (
    consumerDataExchange: string
): Promise<DataExchangeResult> => {
    try {
        //Get the data exchange
        const dataExchange = await DataExchange.findOne({
            consumerDataExchange: consumerDataExchange,
        });
        if (!dataExchange) {
            return null;
        }
        try {
            // Get the contract
            const [contractResp] = await handle(
                getContract(dataExchange.contract)
            );
            const serviceOffering = selfDescriptionProcessor(
                dataExchange.resources[0].serviceOffering,
                dataExchange,
                dataExchange.contract,
                contractResp
            );

            //PEP
            const {
                success: pepSuccess,
                contractID,
                resourceID,
            } = await pepVerification({
                consumerID: dataExchange.consumerId,
                targetResource: serviceOffering,
                referenceURL: dataExchange.contract,
            });

            if (pepSuccess) {
                for (const resource of dataExchange.resources) {
                    const resourceSD = resource.resource;

                    // B to B exchange
                    if (
                        dataExchange._id &&
                        dataExchange.consumerEndpoint &&
                        resourceSD
                    ) {
                        //Call the catalog endpoint
                        const [endpointData, endpointDataError] = await handle(
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
                                case 'REST': {
                                    const [
                                        getProviderData,
                                        getProviderDataError,
                                    ] = await handle(
                                        getRepresentation({
                                                method: endpointData?.representation
                                                ?.method,
                                            endpoint: endpointData?.representation?.url,
                                            credential: endpointData?.representation
                                                ?.credential
                                })
                                    );
                                    data = getProviderData;
                                    break;
                                }
                            }
                        }

                        if (!data) {
                            return {
                                exchange: await dataExchange.updateStatus(
                                    DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                                    'No date found'
                                ),
                                errorMessage: 'No date found',
                            };
                        }

                        try {
                            //Send the data to generic endpoint
                            const [consumerImportRes] = await handle(
                                consumerImport(
                                    dataExchange.consumerEndpoint,
                                    dataExchange._id.toString(),
                                    data,
                                    endpointData?.apiResponseRepresentation
                                )
                            );

                            if (consumerImportRes) {
                                const names = await pepLeftOperandsVerification(
                                    {
                                        targetResource: serviceOffering,
                                    }
                                );
                                await processLeftOperands(
                                    names,
                                    contractID,
                                    resourceID
                                );
                            }
                        } catch (e) {
                            Logger.error({
                                message: e.message,
                                location: e.stack,
                            });
                            return {
                                exchange: await dataExchange.updateStatus(
                                    DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                                    e.message
                                ),
                                errorMessage: e.message,
                            };
                        }
                    }
                }
                return {
                    exchange: await dataExchange.updateStatus(
                        DataExchangeStatusEnum.EXPORT_SUCCESS
                    ),
                };
            } else {
                return {
                    exchange: await dataExchange.updateStatus(
                        DataExchangeStatusEnum.PEP_ERROR,
                        'PEP Error'
                    ),
                    errorMessage: 'PEP Error',
                };
            }
        } catch (e) {
            Logger.error({
                message: e.message,
                location: e.stack,
            });
            return {
                exchange: await dataExchange.updateStatus(
                    DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                    e.message
                ),
                errorMessage: e.message,
            };
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
        return { exchange: null, errorMessage: e.message };
    }
};
