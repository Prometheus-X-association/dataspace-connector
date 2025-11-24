import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../libs/loggers';

export const authKeyCheck = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const apiKey = req.headers['x-exchange-trigger-api-key'];
        const expectedApiKey = process.env.EXCHANGE_TRIGGER_API_KEY;

        // Check if the environment variable is set
        if (!expectedApiKey) {
            Logger.error('EXCHANGE_TRIGGER_API_KEY is not configured');
            res.status(500).json({
                error: 'Connector configuration error',
            });
            return;
        }

        // Check if API key is provided
        if (!apiKey) {
            res.status(401).json({
                error: 'API key is required',
                message:
                    'Please provide an API key in the x-exchange-trigger-api-key header',
            });
            return;
        }

        // Validate API key
        if (apiKey !== expectedApiKey) {
            res.status(403).json({
                error: 'Invalid API key',
                message: 'The provided API key is not valid',
            });
            return;
        }

        // API key is valid, proceed to next middleware
        next();
    } catch (error) {
        Logger.error({
            message: (error as Error).message,
            location: (error as Error).stack,
        });
        res.status(500).json({
            error: 'Internal server error',
        });
    }
};
