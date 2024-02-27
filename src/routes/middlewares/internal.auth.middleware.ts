import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';

export const internalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    const secretKey = config.jwtInternalSecretKey;
    if (!authHeader || !secretKey) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        if (!decoded || typeof decoded !== 'object' || !decoded.internal) {
            throw new Error('Invalid token content');
        }
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
