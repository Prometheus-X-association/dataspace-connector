import { NextFunction, Request, Response } from 'express';
import { decryptJWT } from '../../utils/decryptJWT';

/**
 * Decrypt the jwt from the consent manager
 */
export const consentJwtDecode = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (
        !req.header('Authorization') ||
        !req.header('Authorization').startsWith('Bearer ')
    ) {
        return res
            .status(401)
            .json({ message: 'You need to be authenticated' });
    }
    const token = req.header('Authorization').slice(7);

    const decodedJWT = decryptJWT(token);

    req.params.userId = decodedJWT.sub;

    next();
};
