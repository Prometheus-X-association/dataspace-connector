import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { createCatalogResourceService, getCatalogByIdService, getCatalogService, updateCatalogByIdService } from '../../../services/private/v1/catalog.private.service';

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
        const catalog = await getCatalogService();

        return restfulResponse(res, 200, {
            catalog,
            count: catalog.length,
        });
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
        const catalog = await getCatalogByIdService(req.params.id);

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
        const catalog = await updateCatalogByIdService(req.params.id, req.body);

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

        const catalog = await createCatalogResourceService(
            resourceId,
            type,
        );

        return restfulResponse(res, 200, catalog);
    } catch (err) {
        next(err);
    }
};
