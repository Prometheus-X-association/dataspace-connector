import { consumerError } from '../../../utils/consumerError';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { Logger } from '../../../libs/loggers';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import {
    DataExchange,
    DataExchangeResult,
} from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import { Regexes } from '../../../utils/regexes';
import { getContract } from '../../../libs/third-party/contract';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { consumerImport } from '../../../libs/third-party/consumer';
import postgres from 'postgres'
import {getCredentialByIdService} from "../../private/v1/credential.private.service";

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
                consumerID: dataExchange.consumerEndpoint, //TODO: to verify
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
                                            endpoint:
                                                endpointData?.representation
                                                    ?.url,
                                            credential:
                                                endpointData?.representation
                                                    ?.credential,
                                            dataExchange,
                                            proxy: endpointData?.representation
                                                ?.proxy,
                                            mimeType: endpointData?.representation
                                                ?.mimeType,
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
                                    'No data found'
                                ),
                                errorMessage: 'No data found',
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
                        "The policies can't be verified"
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
