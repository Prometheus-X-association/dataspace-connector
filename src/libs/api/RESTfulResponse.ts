import { Response } from 'express';

/**
 * Returns a RESTful API response with only the resources and no extra payload information
 * @param res Express Response object
 * @param code Response status code
 * @param resource Resource to send
 */
export const restfulResponse = (
    res: Response,
    code: number,
    resource: object
) => {
    return res.status(code).json({
        timestamp: new Date().getTime(),
        code: code,
        content: resource
    });
};
