import { Response } from 'express';

/**
 * Returns raw response
 * @param res Express Response object
 * @param content
 */
export const rawResponse = (
    res: Response,
    content: any,
) => {
    return res.json(content);
};
