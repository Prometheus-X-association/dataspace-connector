import { Request, Response, NextFunction } from 'express';
import { consumerError } from '../../../utils/consumerError';
import { PEP } from '../../../access-control/PolicyEnforcementPoint';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getContractUri } from '../../../libs/loaders/configuration';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import { getCatalogData } from '../../../libs/services/catalog';
import { consumerImport } from '../../../libs/services/consumer';
import { Logger } from '../../../libs/loggers';

export const providerExport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { dataExchangeId, consumerEndpoint, contract } = req.body;

    if (!(await getContractUri())) {
        await consumerError(
            consumerEndpoint,
            dataExchangeId,
            'Provider configuration error'
        );
    }

    const [contractResp, contractRespError] = await handle(
        getContract(contract)
    );

    if (contractRespError) {
        Logger.error({
            message: contractRespError,
            location: 'providerExport - contractRespError',
        });
        return restfulResponse(res, 400, { success: false });
    }

    const httpPattern = /^https?:\/\//;

    let serviceOffering: string;

    if (httpPattern.test(contractResp.serviceOffering)) {
        // Split the string by backslash and get the last element
        const pathElements = contractResp.serviceOffering.split('/');
        serviceOffering = pathElements[pathElements.length - 1];
    } else {
        serviceOffering = contractResp.serviceOffering;
    }

    //PEP
    const pep = await PEP.requestAction({
        action: 'use',
        targetResource: serviceOffering,
        referenceURL: contract,
        referenceDataPath: 'policy',
        fetcherConfig: {},
    });

    if (pep) {
        // //deprecated
        // const so = await Catalog.findOne({
        //     resourceId: serviceOffering,
        // });

        const [serviceOfferingSD, serviceOfferingSDError] = await handle(
            getCatalogData(contractResp?.serviceOffering)
        );

        if (serviceOfferingSDError) {
            Logger.error({
                message: serviceOfferingSDError,
                location: 'providerExport - serviceOfferingSDError',
            });
            return restfulResponse(res, 400, { success: false });
        }

        const resourceSD = serviceOfferingSD.dataResources[0];

        // B to B exchange
        if (dataExchangeId && consumerEndpoint && resourceSD) {
            // //deprecated
            // const resource = await Catalog.findOne({
            //     resourceId: resourceId,
            // }).lean();

            //Call the catalog endpoint
            const [endpointData, endpointDataError] = await handle(
                getCatalogData(resourceSD)
            );

            if (endpointDataError) {
                Logger.error({
                    message: endpointDataError,
                    location: 'providerExport - endpointDataError',
                });
                return restfulResponse(res, 400, { success: false });
            }

            if (!endpointData?.representation) {
                await consumerError(
                    consumerEndpoint,
                    dataExchangeId,
                    'No representation found'
                );
            }

            //Get the DataReprensentation
            //Get the credential

            let data;
            switch (endpointData?.representation?.type) {
                case 'REST':
                    data = await getRepresentation(
                        endpointData?.representation?.method,
                        endpointData?.representation?.url,
                        endpointData?.representation?.credential
                    );
                    break;
            }

            if (!data.data) {
                await consumerError(
                    consumerEndpoint,
                    dataExchangeId,
                    'No Data found'
                );
            }

            //Send the data to generic endpoint
            await handle(
                consumerImport(consumerEndpoint, dataExchangeId, data.data)
            );

            return restfulResponse(res, 200, { success: true });
        } else {
            return restfulResponse(res, 500, { success: false });
        }
    }
};
