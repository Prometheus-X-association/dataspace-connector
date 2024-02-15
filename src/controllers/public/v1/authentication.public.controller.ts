import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../../../utils/types/configuration';
import { errorRes } from '../../../libs/api/APIResponse';
import { generateBearerTokenForPrivateRoutes } from '../../../libs/jwt';
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
        // TODO LOGIN VT ?
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

        const token = await generateBearerTokenForPrivateRoutes(
            req.body.serviceKey,
            req.body.secretKey
        );

        return restfulResponse(res, 200, token);
    } catch (err) {
        next(err);
    }
};
