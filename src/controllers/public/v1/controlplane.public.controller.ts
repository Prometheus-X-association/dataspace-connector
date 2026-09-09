import { NextFunction, Request, Response } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import {
    authorizeControlPlaneParticipant,
    ControlPlaneParticipant,
    createConsentControlPlaneExchange,
    createControlPlaneExchange,
    getControlPlaneExchange,
    reportControlPlaneTransfer,
} from '../../../services/public/v1/controlplane.public.service';

export const createControlPlaneExchangeRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const exchange = await createControlPlaneExchange(req.body);
        return restfulResponse(res, 201, exchange);
    } catch (err) {
        next(err);
    }
};

export const authorizeControlPlaneExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await authorizeControlPlaneParticipant(
            req.params.id,
            req.body.participant as ControlPlaneParticipant,
            req.body.signedConsent && req.body.encrypted
                ? {
                      signedConsent: req.body.signedConsent,
                      encrypted: req.body.encrypted,
                  }
                : undefined
        );
        return restfulResponse(res, result.authorized ? 200 : 403, result);
    } catch (err) {
        next(err);
    }
};

export const getControlPlaneExchangeRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const exchange = await getControlPlaneExchange(req.params.id);
        return restfulResponse(res, 200, exchange);
    } catch (err) {
        next(err);
    }
};

export const createConsentControlPlaneExchangeRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const exchange = await createConsentControlPlaneExchange(
            {
                signedConsent: req.body.signedConsent,
                encrypted: req.body.encrypted,
            },
            req.body.callbackUrl
        );
        return restfulResponse(res, 201, exchange);
    } catch (err) {
        next(err);
    }
};

export const reportControlPlaneExchangeTransfer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const exchange = await reportControlPlaneTransfer(
            req.params.id,
            req.body.participant as ControlPlaneParticipant,
            req.body.success,
            req.body.metadata
        );
        return restfulResponse(res, 200, exchange);
    } catch (err) {
        next(err);
    }
};
