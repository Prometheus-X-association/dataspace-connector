import { Request, Response, NextFunction } from "express";
import {Catalog} from "../../../utils/types/catalog";
import {restfulResponse} from "../../../libs/api/RESTfulResponse";
export const getCatalog = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const catalog = await Catalog.find().select('-__v').lean();

        return restfulResponse(res, 200, catalog)
    } catch (err) {
        next(err);
    }
};

export const getCatalogById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const catalog = await Catalog.findById(req.params.id).select('-__v').lean();

        return restfulResponse(res, 200, catalog)
    } catch (err) {
        next(err);
    }
};

export const updateCatalogById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const catalog = await Catalog.findByIdAndUpdate(req.params.id, {...req.body}).select('-__v').lean();

        return restfulResponse(res, 200, catalog)
    } catch (err) {
        next(err);
    }
};
