import { Request, Response, NextFunction } from 'express';
import { InfastructureWebhookService } from '../../../services/public/v1/infrastructure.public.service';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';

export const InfrastructureWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dataExchangeId, data } = req.body;
        await InfastructureWebhookService(dataExchangeId, data);
        restfulResponse(res, 200, { success: true });
    } catch (err) {
        next(err);
    }
};
