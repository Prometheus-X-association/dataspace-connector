import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange } from '../../../utils/types/dataExchange';
import {
    dataExchangeError,
    dataExchangeSuccess,
} from './dataExchange.public.controller';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import { providerExport } from '../../../libs/services/provider';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';
import { pepVerification } from '../../../utils/pepVerification';

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
    //req.body
    const { providerEndpoint, contract, resourceId, purposeId } = req.body;

    Logger.info({
        message: providerEndpoint,
        location: 'consumerExchange - providerEndpoint',
    });

    Logger.info({
        message: contract,
        location: 'consumerExchange - contract',
    });

    Logger.info({
        message: resourceId,
        location: 'consumerExchange - resourceId',
    });

    Logger.info({
        message: purposeId,
        location: 'consumerExchange - purposeId',
    });

    const [contractResponse, contractResponseError] = await handle(
        getContract(contract)
    );

    Logger.info({
        message: JSON.stringify(contractResponse, null, 2),
        location: 'consumerExchange - contractResponse',
    });

    if (contractResponseError) {
        Logger.error({
            message: contractResponseError,
            location: 'consumerExchange - contractResponseError',
        });
        return restfulResponse(res, 400, { success: false });
    }

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

    Logger.info({
        message: JSON.stringify(dataExchange, null, 2),
        location: 'consumerExchange - dataExchange',
    });

    //Trigger provider.ts endpoint exchange
    const [providerExp, providerExpError] = await handle(
        providerExport(providerEndpoint, dataExchange, contract)
    );

    if (providerExpError) {
        Logger.error({
            message: providerExpError,
            location: 'consumerExchange - providerExpError',
        });

        return restfulResponse(res, 500, { success: false });
    }

    return restfulResponse(res, 200, { success: true });
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
    const { dataExchangeId, data } = req.body;

    //Get dataExchangeId
    const dataExchange = await DataExchange.findById(dataExchangeId).lean();

    //retrieve endpoint
    const [contract, contractError] = await handle(
        getContract(dataExchange.contract)
    );

    if (contractError) {
        Logger.error({
            message: contractError,
            location: 'consumerImport - contractError',
        });
        return restfulResponse(res, 400, { success: false });
    }

    // const pathElements = contract?.serviceOffering.split('/');
    // const serviceOffering = pathElements[pathElements.length - 1];

    //PEP
    const pep = await pepVerification({
        targetResource: dataExchange.resourceId,
        referenceURL: dataExchange.contract,
    });

    if (pep) {
        const [catalogServiceOffering, catalogServiceOfferingError] =
            await handle(getCatalogData(dataExchange.purposeId));

        if (catalogServiceOfferingError) {
            Logger.error({
                message: catalogServiceOfferingError,
                location: 'consumerImport - catalogServiceOfferingError',
            });
            return restfulResponse(res, 400, { success: false });
        }

        const [catalogSoftwareResource, catalogSoftwareResourceError] =
            await handle(
                getCatalogData(catalogServiceOffering?.softwareResources[0])
            );

        if (catalogSoftwareResourceError) {
            Logger.error({
                message: catalogSoftwareResourceError,
                location: 'consumerImport - catalogSoftwareResourceError',
            });
            return restfulResponse(res, 400, { success: false });
        }

        //Import data to endpoint of softwareResource
        const endpoint = catalogSoftwareResource?.representation?.url;

        if (!endpoint) {
            await dataExchangeError(dataExchangeId, 'consumer');
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

                    if (postConsumerDataError) {
                        Logger.error({
                            message: postConsumerDataError,
                            location: 'consumerImport - postConsumerDataError',
                        });
                        return restfulResponse(res, 400, { success: false });
                    }
                    break;
            }

            await dataExchangeSuccess(dataExchangeId, 'consumer');
        }
        return restfulResponse(res, 200, { success: true });
    } else {
        await dataExchangeError(dataExchangeId, 'consumer');
        return restfulResponse(res, 500, { success: false });
    }
};
