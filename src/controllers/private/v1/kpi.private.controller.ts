import { NextFunction, Request, Response } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import {
    getKpiByOfferService,
    getKpiErrorsService,
    getKpiOverviewService,
    getKpiServiceChainService,
    getKpiSimpleService,
    getKpiVolumeService,
} from '../../../services/private/v1/kpi.private.service';

function extractRole(req: Request): 'provider' | 'consumer' | undefined {
    if (req.query.role === 'provider') return 'provider';
    if (req.query.role === 'consumer') return 'consumer';
    return undefined;
}

/**
 * GET /private/kpis/exchanges/overview
 * Returns global exchange KPIs: totals, success rate, bytes, simple vs service-chain breakdown.
 */
export const getKpiOverview = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const overview = await getKpiOverviewService(extractRole(req));
        return restfulResponse(res, 200, overview);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /private/kpis/exchanges/by-offer
 * Returns exchange count and success rate grouped by service offering URI.
 * Query param: type=resource|purpose (default: resource)
 */
export const getKpiByOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const type = req.query.type === 'purpose' ? 'purpose' : 'resource';
        const byOffer = await getKpiByOfferService(type, extractRole(req));
        return restfulResponse(res, 200, byOffer);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /private/kpis/exchanges/service-chain
 * Returns total service-chain exchanges and their success rate.
 */
export const getKpiServiceChain = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const serviceChain = await getKpiServiceChainService(extractRole(req));
        return restfulResponse(res, 200, serviceChain);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /private/kpis/exchanges/simple
 * Returns total simple (bilateral) exchanges and their success rate.
 */
export const getKpiSimple = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const simple = await getKpiSimpleService(extractRole(req));
        return restfulResponse(res, 200, simple);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /private/kpis/exchanges/volume
 * Returns exchange volume over time (by day) and total bytes transferred.
 * Query params: from (ISO date), to (ISO date) — both optional.
 */
export const getKpiVolume = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const from =
            typeof req.query.from === 'string' ? req.query.from : undefined;
        const to = typeof req.query.to === 'string' ? req.query.to : undefined;
        const volume = await getKpiVolumeService(from, to, extractRole(req));
        return restfulResponse(res, 200, volume);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /private/kpis/exchanges/errors
 * Returns recent failed exchanges with debugging context (contract, participant,
 * error message, payload, connector name).
 * Query param: role=provider|consumer (optional)
 */
export const getKpiErrors = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const errors = await getKpiErrorsService(extractRole(req));
        return restfulResponse(res, 200, errors);
    } catch (err) {
        next(err);
    }
};
