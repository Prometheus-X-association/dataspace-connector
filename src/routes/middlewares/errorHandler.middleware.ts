import { AxiosError } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../errors/CustomError';
import { Logger } from '../../libs/loggers';

export const globalErrorHandler = async (
    err: Error | CustomError | AxiosError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Logger.error({
        location: err.stack,
        message: err.message,
    });

    const serverError = (customMessage = '') => {
        return res.status(500).json({
            error: 'internal-server-error',
            statusCode: 500,
            message: customMessage || undefined,
        });
    };

    if (err instanceof CustomError) {
        if (err.isCustomError) {
            return serverError(err.message);
        }
    }

    // HANDLE AXIOS ERRORS
    if (err instanceof AxiosError) {
        if (err.isAxiosError) {
            return res.status(424).json({
                error: 'Something went wrong when communicating with a third-party service',
                message: err.message,
                errorCode: 424,
            });
        }
    }

    return serverError('Unknown Error');
    return next(); // For ts to be happy
};
