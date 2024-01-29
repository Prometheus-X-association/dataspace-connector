import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../../../utils/types/configuration';
import { errorRes, successRes } from '../../../libs/api/APIResponse';
import { generateBearerTokenForPrivateRoutes } from '../../../libs/jwt';

/**
 * Login a participant into his connector
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

        return successRes({
            code: 200,
            req,
            res,
            message: 'Successful login',
            data: {
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};
