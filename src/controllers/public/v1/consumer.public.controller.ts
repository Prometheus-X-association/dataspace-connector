import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange } from '../../../utils/types/dataExchange';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import {
    providerExport,
    providerImport,
} from '../../../libs/services/provider';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';

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
        const { providerEndpoint, contract, resourceId, purposeId } = req.body;

        // retrieve contract
        const [contractResponse] = await handle(getContract(contract));

        //Create a data Exchange
        let dataExchange;
        if (contract.includes('contracts')) {
            dataExchange = await DataExchange.create({
                providerEndpoint: providerEndpoint,
                resourceId: resourceId,
                purposeId: purposeId,
                contract: contract,
                status: 'PENDING',
                createdAt: new Date(),
            });
        } else {
            dataExchange = await DataExchange.create({
                providerEndpoint: providerEndpoint,
                resourceId: contractResponse.serviceOffering,
                purposeId: contractResponse.purpose[0].purpose,
                contract: contract,
                status: 'PENDING',
                createdAt: new Date(),
            });
        }

        // Create the data exchange at the provider
        // @ts-ignore
        await dataExchange.createDataExchangeToOtherParticipant('provider');

        // return code 200 everything is ok
        restfulResponse(res, 200, { success: true });

        //Trigger provider.ts endpoint exchange
        await handle(
            providerExport(providerEndpoint, dataExchange._id.toString())
        );
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
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
        const [contractResp] = await handle(getContract(dataExchange.contract));
        selfDescriptionProcessor(
            dataExchange.resourceId,
            dataExchange,
            dataExchange.contract,
            contractResp
        );
        const [catalogServiceOffering] = await handle(
            getCatalogData(dataExchange.purposeId)
        );

        const [catalogSoftwareResource] = await handle(
            getCatalogData(catalogServiceOffering?.softwareResources[0])
        );

        //Import data to endpoint of softwareResource
        const endpoint = catalogSoftwareResource?.representation?.url;

        if (!endpoint) {
            // @ts-ignore
            await dataExchange.updateStatus(
                DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR
            );
        } else {
            if (catalogSoftwareResource?.representation?.type === 'REST') {
                // eslint-disable-next-line no-case-declarations
                const [postConsumerData] = await handle(
                    postRepresentation(
                        catalogSoftwareResource?.representation?.method,
                        endpoint,
                        data,
                        catalogSoftwareResource?.representation?.credential
                    )
                );

                if (catalogSoftwareResource.isAPI) {
                    if (apiResponseRepresentation) {
                        await handle(
                            providerImport(
                                dataExchange.providerEndpoint,
                                postConsumerData,
                                dataExchange._id.toString()
                            )
                        );
                    }
                    // @ts-ignore
                    await dataExchange.updateStatus(
                        DataExchangeStatusEnum.IMPORT_SUCCESS
                    );
                    return restfulResponse(res, 200, postConsumerData);
                }
            }

            // @ts-ignore
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

        // @ts-ignore
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR,
            e.message
        );

        return restfulResponse(res, 500, { success: false });
    }
};
