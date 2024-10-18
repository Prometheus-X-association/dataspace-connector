import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { addCorsOriginService, getConfigurationService, reloadConfigurationService, removeCorsOriginService, resetConfigurationService, updateConfigurationService, updateConsentConfigurationService } from '../../../services/private/v1/configuration.private.service';

/**
 * Get the configuration of the Data space connector
 * @param req
 * @param res
 * @param next
 */
export const getConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await getConfigurationService();

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * update the configuration
 * @param req
 * @param res
 * @param next
 */
export const updateConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await updateConfigurationService(req.body);

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * update the consent URI of the configuration
 * @param req
 * @param res
 * @param next
 */
export const updateConsentConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await updateConsentConfigurationService(req.body.uri, req.body.key);
        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * reset the configuration
 * @param req
 * @param res
 * @param next
 */
export const resetConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await resetConfigurationService();

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * reload the configuration
 * @param req
 * @param res
 * @param next
 */
export const reloadConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const conf = await reloadConfigurationService();
        return restfulResponse(res, 200, conf);
    } catch (err) {
        next(err);
    }
};

/**
 * Add a cors origin to the configuration
 * @param req
 * @param res
 * @param next
 */
export const addCorsOrigin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { origin } = req.body;
        const configuration = await addCorsOriginService(origin);

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};
/**
 * Remove a cors origin from the configuration
 * @param req
 * @param res
 * @param next
 */
export const removeCorsOrigin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const configuration = await removeCorsOriginService(id);

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};