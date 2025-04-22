import { NextFunction, Request, Response } from 'express';
import { Logger } from '../../../libs/loggers';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import {
    exportDataService,
    importDataService,
} from '../../../services/public/v1/data.public.service';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { DataExchangeResult } from '../../../utils/types/dataExchange';

/**
 * Export data for the provider in the consent flow
 * @param req
 * @param res
 * @param next
 */
export const exportData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { signedConsent, encrypted } = req.body;

    if (!signedConsent || !encrypted)
        return res.status(400).json({
            error: 'Missing params from request payload',
        });

    try {
        const result: DataExchangeResult = await exportDataService({
            signedConsent,
            encrypted,
        });

        if (
            result.exchange !== null &&
            result.exchange.status === DataExchangeStatusEnum.EXPORT_SUCCESS
        ) {
            return restfulResponse(res, 200, { success: true, message: 'OK' });
        } else {
            Logger.error({
                message: result.errorMessage,
            });
            return restfulResponse(res, 400, { success: false, error: '' });
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return res.status(500).json({
            error: 'An unexpected error occurred',
        });
    }
};

/**
 * Import data endpoint for the consumer in the consent flow
 * @param req
 * @param res
 * @param next
 */
export const importData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            data,
            user,
            signedConsent,
            encrypted,
            apiResponseRepresentation,
            isPayload,
            resource,
        } = req.body;

        const errors = [];
        if (!signedConsent) errors.push('missing signedConsent');
        if (!data) errors.push('missing data');
        if (!user) errors.push('missing user');

        if (errors.length > 0) {
            return restfulResponse(res, 400, {
                error: 'missing params from request payload',
                errors,
            });
        }

        const result: DataExchangeResult = await importDataService({
            data,
            user,
            signedConsent,
            encrypted,
            apiResponseRepresentation,
            isPayload,
            resource,
        });

        if (
            result.exchange !== null &&
            result.exchange.status === DataExchangeStatusEnum.IMPORT_SUCCESS
        ) {
            return restfulResponse(res, 200, { success: true, message: 'OK' });
        } else {
            return restfulResponse(res, 400, {
                success: false,
                error: result.errorMessage,
            });
        }
    } catch (error) {
        Logger.error({
            message: error.message,
            location: error.stack,
        });
        return restfulResponse(res, 500, {
            success: false,
            message: 'An unexpected error occurred',
        });
    }
};
