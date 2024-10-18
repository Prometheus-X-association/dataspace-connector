import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';
import { DataExchange } from '../../../utils/types/dataExchange';
import { ProviderExportService } from '../../../services/public/v1/provider.public.service';

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
    const { infrastructure } = req.query;

    restfulResponse(res, 200, {
        success: await ProviderExportService(consumerDataExchange, { infrastructure: infrastructure === 'true' }),
    });
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
            getCatalogData(dataExchange.resources[0].serviceOffering)
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
