import { Request, Response, NextFunction } from 'express';
import { Catalog } from '../../../utils/types/catalog';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getCatalogUri } from '../../../libs/loaders/configuration';
import { urlChecker } from '../../../utils/urlChecker';

/**
 * Get all the catalog
 * @param req
 * @param res
 * @param next
 */
export const getCatalog = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const catalog = await Catalog.find().select('-__v').lean();

        return restfulResponse(res, 200, catalog);
    } catch (err) {
        next(err);
    }
};

/**
 * get a ressource by id
 * @param req
 * @param res
 * @param next
 */
export const getCatalogById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const catalog = await Catalog.findById(req.params.id)
            .select('-__v')
            .lean();

        return restfulResponse(res, 200, catalog);
    } catch (err) {
        next(err);
    }
};

/**
 * update a resource by id
 * @param req
 * @param res
 * @param next
 */
export const updateCatalogById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const catalog = await Catalog.findByIdAndUpdate(req.params.id, {
            ...req.body,
        })
            .select('-__v')
            .lean();

        return restfulResponse(res, 200, catalog);
    } catch (err) {
        next(err);
    }
};

/**
 * create a resource manually
 * @param req
 * @param res
 * @param next
 */
export const createCatalogResource = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { resourceId, type } = req.body;

        const catalog = await Catalog.create({
            resourceId,
            type,
            endpoint: urlChecker(
                await getCatalogUri(),
                `${type}/${resourceId}`
            ),
            enabled: true,
        });

        return restfulResponse(res, 200, catalog);
    } catch (err) {
        next(err);
    }
};
