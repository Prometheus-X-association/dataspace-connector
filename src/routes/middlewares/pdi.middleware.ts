import { NextFunction, Request, Response } from 'express';
import { verifyPDIToken } from '../../libs/jwt';

/**
 * Checks the validation pipeline of express-validator
 */
export const pdiMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.header('Authorization')) {
        return res
            .status(401)
            .json({ message: 'You need to be authenticated' });
    }
    if (!req.header('Authorization').startsWith('Bearer ')) {
        return res
            .status(401)
            .json({ message: 'You need to be authenticated' });
    }
    const token = req.header('Authorization').slice(7);
    const jwt = await verifyPDIToken(token);
    if (!jwt) return res.status(401).json('You need to be Authenticated');
    else next();
};
