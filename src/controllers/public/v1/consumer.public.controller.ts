import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange } from '../../../utils/types/dataExchange';
import {
    dataExchangeError,
    dataExchangeSuccess,
} from './dataExchange.public.controller';
import { PEP } from '../../../access-control/PolicyEnforcementPoint';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import { providerExport } from '../../../libs/services/provider';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';

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

    const [contractResponse, contractResponseError] = await handle(
        getContract(contract)
    );

    if (contractResponseError) {
        Logger.error({
            message: contractResponseError,
            location: 'consumerExchange - contractResponseError',
        });
        return restfulResponse(res, 400, { success: false });
    }

    // TODO
    //Contract verification
    //get the contract to retrieve the providerEndpoint
    //get the softwareResource endpoint

    //retrieve endpoint

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

    //Trigger provider.ts endpoint exchange
    handle(providerExport(providerEndpoint, dataExchange, contract));

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
    const pep = await PEP.requestAction({
        action: 'use',
        targetResource: dataExchange.resourceId,
        referenceURL: dataExchange.contract,
        referenceDataPath: dataExchange.contract.includes('contracts')
            ? 'rolesAndObligations.policies'
            : 'policy',
        fetcherConfig: {},
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
