import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange, IDataExchange } from '../../../utils/types/dataExchange';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import {
    providerExport,
    providerImport,
} from '../../../libs/third-party/provider';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { Logger } from '../../../libs/loggers';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import {
    triggerBilateralFlow,
    triggerEcosystemFlow,
} from '../../../services/public/v1/consumer.public.service';
import { ProviderExportService } from '../../../services/public/v1/provider.public.service';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { ExchangeError } from '../../../libs/errors/exchangeError';
import axios from 'axios';

/**
 * trigger the data exchange between provider and consumer in a bilateral or ecosystem contract
 * @param req
 * @param res
 * @param next
 */
export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        const {
            resources,
            contract,
            resourceId,
            purposeId,
            providerParams,
            dataProcessingId,
        } = req.body;

        //Create a data Exchange
        let dataExchange: IDataExchange;
        let providerEndpoint: string;

        // ecosystem contract
        if (contract.includes('contracts')) {
            const {
                dataExchange: ecosystemDataExchange,
                providerEndpoint: endpoint,
            } = await triggerEcosystemFlow({
                purposeId,
                resourceId,
                contract,
                resources,
                providerParams,
                dataProcessingId,
            });

            dataExchange = ecosystemDataExchange;
            if (endpoint) providerEndpoint = endpoint;
        } else {
            const {
                dataExchange: bilateralDataExchange,
                providerEndpoint: endpoint,
            } = await triggerBilateralFlow({
                contract,
                resources,
                providerParams,
                dataProcessingId,
            });

            dataExchange = bilateralDataExchange;
            if (endpoint) providerEndpoint = endpoint;
        }

        if (!dataExchange) {
            throw new ExchangeError(
                'Error when trying to initiate te exchange.',
                'triggerEcosystemFlow',
                500
            );
        }

        if(dataProcessingId && dataExchange.dataProcessing
            .infrastructureServices.length > 0){
            for (const infrastructureService of dataExchange.dataProcessing
                .infrastructureServices) {
                // Get the infrastructure service information
                const [participantResponse] = await handle(
                    axios.get(infrastructureService.participant)
                );

                // Find the participant endpoint
                const participantEndpoint = participantResponse.dataspaceEndpoint;

                // Sync the data exchange with the infrastructure
                await dataExchange.syncWithInfrastructure(participantEndpoint);
            }
        }

        //Trigger provider.ts endpoint exchange
        if (dataExchange.consumerEndpoint) {
            const updatedDataExchange = await DataExchange.findById(
                dataExchange._id
            );

            await ProviderExportService(
                updatedDataExchange.consumerDataExchange
            );
        } else {
            if (providerEndpoint === (await getEndpoint())) {
                Logger.error({
                    message: "Can't make request to itself.",
                    location: 'consumerExchange',
                });
                throw new ExchangeError(
                    "Can't make request to itself.",
                    'triggerEcosystemFlow',
                    500
                );
            }
            await handle(
                providerExport(providerEndpoint, dataExchange._id.toString())
            );
        }
        // return code 200 everything is ok
        restfulResponse(res, 200, { success: true });
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        restfulResponse(res, 500, { success: false, message: e.message });
    }
};

/**
 * import the data from the provider into the consumer software representation
 * @param req
 * @param res
 * @param next
 */
export const consumerImport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //req.body
    const { providerDataExchange, data, apiResponseRepresentation } = req.body;

    //Get dataExchangeId
    const dataExchange = await DataExchange.findOne({
        providerDataExchange: providerDataExchange,
    });

    try {
        //retrieve endpoint
        // const [contractResp] = await handle(
        //     getContract(dataExchange.contract)
        // );

        // const serviceOffering = selfDescriptionProcessor(dataExchange.resource[0].serviceOffering, dataExchange, dataExchange.contract, contractResp)

        //PEP
        // const {pep} = await pepVerification({
        //     targetResource: dataExchange.purposeId,
        //     referenceURL: dataExchange.contract,
        // });
        //
        // if (pep) {
        const [catalogServiceOffering, catalogServiceOfferingError] =
            await handle(getCatalogData(dataExchange.purposeId));

        const [catalogSoftwareResource, catalogSoftwareResourceError] =
            await handle(
                getCatalogData(catalogServiceOffering?.softwareResources[0])
            );

        //Import data to endpoint of softwareResource
        const endpoint = catalogSoftwareResource?.representation?.url;

        if (!endpoint) {
            await dataExchange.updateStatus(
                DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR
            );
        } else {
            switch (catalogSoftwareResource?.representation?.type) {
                case 'REST':
                    // eslint-disable-next-line no-case-declarations
                    const [postConsumerData, postConsumerDataError] =
                        await handle(
                            postRepresentation(
                                catalogSoftwareResource?.representation?.method,
                                endpoint,
                                data,
                                catalogSoftwareResource?.representation
                                    ?.credential
                            )
                        );

                    if (catalogSoftwareResource.isAPI) {
                        if (apiResponseRepresentation) {
                            const [
                                providerImportData,
                                providerImportDataError,
                            ] = await handle(
                                providerImport(
                                    dataExchange.providerEndpoint,
                                    postConsumerData,
                                    dataExchange._id.toString()
                                )
                            );
                        }
                        await dataExchange.updateStatus(
                            DataExchangeStatusEnum.IMPORT_SUCCESS
                        );
                        return restfulResponse(res, 200, postConsumerData);
                    }

                    break;
            }
            await dataExchange.updateStatus(
                DataExchangeStatusEnum.IMPORT_SUCCESS
            );
        }
        return restfulResponse(res, 200, { success: true });
        // } else {
        //     // @ts-ignore
        //     await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR)
        //     return restfulResponse(res, 500, { success: false });
        // }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        await dataExchange.updateStatus(
            DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR,
            e.message
        );

        return restfulResponse(res, 500, { success: false });
    }
};
