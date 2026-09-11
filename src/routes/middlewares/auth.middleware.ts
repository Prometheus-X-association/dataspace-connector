import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../../libs/jwt';

/**
 * Checks the validation pipeline of express-validator
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    if (
        !req.header('Authorization') ||
        !req.header('Authorization').startsWith('Bearer ')
    ) {
        return res
            .status(401)
            .json({ message: 'You need to be authenticated' });
    }
    const token = req.header('Authorization').slice(7);
    try {
        const jwt = await verifyToken(token);
        if (!jwt) return res.status(401).json('You need to be Authenticated');
        else next();
    } catch (error) {
        return res.status(401).json('You need to be Authenticated');
    }
};

/**
 * Combined auth for KPI routes: accepts the x-kpi-api-key header
 * (used by monitoring dashboards and external tools that cannot manage short-lived JWTs)
 * OR a standard JWT Bearer token.
 */
export const kpiAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    const apiKey = req.headers['x-kpi-api-key'];
    const expectedApiKey = process.env.KPI_API_KEY;
    if (expectedApiKey && apiKey === expectedApiKey) {
        return next();
    }
    return auth(req, res, next);
};
