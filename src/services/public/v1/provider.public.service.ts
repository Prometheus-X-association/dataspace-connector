import { DataExchange } from '../../../utils/types/dataExchange';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { getCatalogData } from '../../../libs/services/catalog';
import { consumerError } from '../../../utils/consumerError';
import { Regexes } from '../../../utils/regexes';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { consumerImport } from '../../../libs/services/consumer';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import { Logger } from '../../../libs/loggers';

export const ProviderExportService = async (consumerDataExchange: string) => {
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
                            case 'REST':
                                // eslint-disable-next-line no-case-declarations
                                const [getProviderData, getProviderDataError] =
                                    await handle(
                                        getRepresentation({
                                            resource: resourceSD,
                                            method: endpointData?.representation
                                                ?.method,
                                            endpoint:
                                                endpointData?.representation
                                                    ?.url,
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
                            const names = await pepLeftOperandsVerification({
                                targetResource: serviceOffering,
                                referenceURL: dataExchange.contract,
                            });
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
                    }
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
