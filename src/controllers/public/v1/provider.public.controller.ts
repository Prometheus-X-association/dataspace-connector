import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { Logger } from '../../../libs/loggers';
import { DataExchange } from '../../../utils/types/dataExchange';
import { ProviderExportService } from '../../../services/public/v1/provider.public.service';

/**
 * provider export data from data representation
 * @param req
 * @param res
 */
export const providerExport = async (req: Request, res: Response) => {
    const { consumerDataExchange } = req.body;

    restfulResponse(res, 200, {
        success: await ProviderExportService(consumerDataExchange),
    });
};

/**
 * provider import API response from consumer
 * @param req
 * @param res
 */
export const providerImport = async (req: Request, res: Response) => {
    try {
        const { data, consumerDataExchange } = req.body;

        const dataExchange = await DataExchange.findOne({
            consumerDataExchange: consumerDataExchange,
        }).lean();

        const [catalogServiceOffering] = await handle(
            getCatalogData(dataExchange.resources[0].serviceOffering)
        );

        const [catalogSoftwareResource] = await handle(
            getCatalogData(catalogServiceOffering?.dataResources[0])
        );

        //Import data to endpoint of softwareResource
        const endpoint =
            catalogSoftwareResource?.apiResponseRepresentation?.url;

        if (endpoint) {
            switch (catalogSoftwareResource?.apiResponseRepresentation?.type) {
                case 'REST':
                    await handle(
                        postRepresentation({
                            method: catalogSoftwareResource
                                ?.apiResponseRepresentation?.method,
                            endpoint,
                            data,
                            credential:
                                catalogSoftwareResource
                                    ?.apiResponseRepresentation?.credential,
                            dataExchange,
                        })
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
