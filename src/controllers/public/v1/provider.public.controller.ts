import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';
import { DataExchange, IDataExchange } from '../../../utils/types/dataExchange';
import { providerExportService } from '../../../services/public/v1/provider.public.service';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';

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
    try {
        const { consumerDataExchange } = req.body;
        const exchange: IDataExchange = await providerExportService(
            consumerDataExchange
        );
        if (
            exchange !== null &&
            exchange.status === DataExchangeStatusEnum.EXPORT_SUCCESS
        ) {
            return restfulResponse(res, 200, { success: true });
        } else {
            return restfulResponse(res, 500, { success: false });
        }
    } catch (error) {
        Logger.error({
            message: error.message,
            location: error.stack,
        });
        return restfulResponse(res, 500, {
            success: false,
            message: 'An unexpected error occurred',
        });
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
