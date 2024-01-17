import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * Checks the validation pipeline of express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).jsonp(errors.array());
    } else {
        next();
    }
};
