import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange } from '../../../utils/types/dataExchange';
import {
    dataExchangeError,
    dataExchangeSuccess,
} from '../../public/v1/dataExchange.public.controller';
import { PEP } from '../../../access-control/PolicyEnforcementPoint';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import { providerExport } from '../../../libs/services/provider';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';

export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //req.body
    const { providerEndpoint, contract } = req.body;

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
    const dataExchange = await DataExchange.create({
        providerEndpoint: providerEndpoint,
        resourceId: contractResponse.serviceOffering,
        contract: contract,
        status: 'PENDING',
        createdAt: new Date(),
    });

    //Trigger provider.ts endpoint exchange
    await handle(
        providerExport(providerEndpoint, dataExchange._id.toString(), contract)
    );

    return restfulResponse(res, 200, { success: true });
};

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

    const pathElements = contract?.serviceOffering.split('/');
    const serviceOffering = pathElements[pathElements.length - 1];

    //PEP
    const pep = await PEP.requestAction({
        action: 'use',
        targetResource: serviceOffering,
        referenceURL: dataExchange.contract,
        referenceDataPath: 'policy',
        fetcherConfig: {},
    });

    if (pep) {
        // //No more need of this step because we use the sd
        // const catalogSo = await Catalog.findOne({
        //     endpoint: contract.data.purpose[0].purpose,
        // }).lean();

        const [catalogServiceOffering, catalogServiceOfferingError] =
            await handle(getCatalogData(contract?.purpose[0].purpose));

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
