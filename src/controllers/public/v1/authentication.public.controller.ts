import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../../../utils/types/configuration';
import { errorRes } from '../../../libs/api/APIResponse';
import {
    generateBearerTokenForLoginRoutes,
    refreshToken,
    regenerateToken,
} from '../../../libs/jwt';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';

/**
 * Login a participant into the connector
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const config = await Configuration.findOne({
            serviceKey: req.body.serviceKey,
            secretKey: req.body.secretKey,
        }).lean();

        if (!config)
            return errorRes({
                req,
                res,
                code: 404,
                errorMsg: 'Wrong credentials',
                message: 'Wrong credentials',
            });

        const token = await generateBearerTokenForLoginRoutes(
            req.body.serviceKey,
            req.body.secretKey
        );

        return restfulResponse(res, 200, token);
    } catch (err) {
        next(err);
    }
};

/**
 * Refresh JWT and refresh Token
 */
export const refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //refresh jwt and refresh from valid jwt or refreshToken
        const token = await refreshToken(req.body.refreshToken);

        return restfulResponse(res, 200, token);
    } catch (err) {
        next(err);
    }
};

/**
 * Refresh JWT and refresh Token
 */
export const regenerate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //refresh jwt and refresh from valid jwt or refreshToken
        const token = await regenerateToken(req.body.refreshToken);

        return restfulResponse(res, 200, token);
    } catch (err) {
        next(err);
    }
};
