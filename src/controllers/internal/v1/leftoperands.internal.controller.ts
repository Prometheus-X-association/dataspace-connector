import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';

export const getCount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { contractId, resourceId } = req.params;
        const count = 0;
        return restfulResponse(res, 200, { count });
    } catch (err) {
        next(err);
    }
};
