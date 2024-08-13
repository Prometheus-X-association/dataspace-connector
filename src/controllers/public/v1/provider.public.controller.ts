import { Request, Response, NextFunction } from 'express';
import { consumerError } from '../../../utils/consumerError';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import {
    getRepresentation,
    postRepresentation,
} from '../../../libs/loaders/representationFetcher';
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
import { DataExchange } from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import { Regexes } from '../../../utils/regexes';

/**
 * provider export data from data representation
 * @param req
 * @param res
 * @param next
 */
export const providerExport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { consumerDataExchange } = req.body;

    //Get the data exchange
    const dataExchange = await DataExchange.findOne({
        consumerDataExchange: consumerDataExchange,
    });

    try {
        // Get the contract
        const [contractResp] = await handle(getContract(dataExchange.contract));

        const serviceOffering = selfDescriptionProcessor(
            dataExchange.resource[0].serviceOffering,
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
            targetResource: serviceOffering,
            referenceURL: dataExchange.contract,
        });

        if (pepSuccess) {
            for (const resource of dataExchange.resource) {
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
                                        getRepresentation(
                                            endpointData?.representation
                                                ?.method,
                                            endpointData?.representation?.url,
                                            endpointData?.representation
                                                ?.credential
                                        )
                                    );

                                data = getProviderData;
                                break;
                        }
                    }

                    if (!data) {
                        // @ts-ignore
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

            restfulResponse(res, 200, { success: true });
        } else {
            // @ts-ignore
            await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR);
            restfulResponse(res, 500, { success: false });
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        // @ts-ignore
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
            e.message
        );
    }
};

export const providerImport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { data, consumerDataExchange } = req.body;

        const dataExchange = await DataExchange.findOne({
            consumerDataExchange: consumerDataExchange,
        }).lean();

        const [catalogServiceOffering] = await handle(
            getCatalogData(dataExchange.resource[0].serviceOffering)
        );

        const [catalogSoftwareResource, catalogSoftwareResourceError] =
            await handle(
                getCatalogData(catalogServiceOffering?.dataResources[0])
            );

        //Import data to endpoint of softwareResource
        const endpoint =
            catalogSoftwareResource?.apiResponseRepresentation?.url;

        if (endpoint) {
            switch (catalogSoftwareResource?.apiResponseRepresentation?.type) {
                case 'REST':
                    // eslint-disable-next-line no-case-declarations
                    await handle(
                        postRepresentation(
                            catalogSoftwareResource?.apiResponseRepresentation
                                ?.method,
                            endpoint,
                            data,
                            catalogSoftwareResource?.apiResponseRepresentation
                                ?.credential
                        )
                    );
                    break;
            }
        } else {
            return restfulResponse(res, 500, { success: true });
        }
        return restfulResponse(res, 200, { success: true });
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        return restfulResponse(res, 500, { success: false });
    }
};
