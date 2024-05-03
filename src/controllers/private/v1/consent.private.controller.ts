import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../../libs/loggers';
import { User } from '../../../utils/types/user';
import {
    consentServiceGetPrivacyNoticeById,
    consentServiceGetPrivacyNotices,
    consentServiceGetUserConsent,
    consentServiceGetUserConsentById,
    consentServiceMe,
    consentServiceMeConsentById,
    consentServiceGiveConsent,
    consentServiceDataExchange,
    consentServiceAvailableExchanges,
    consentServiceRevoke,
} from '../../../libs/services/consent';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { urlChecker } from '../../../utils/urlChecker';

/**
 * Get consent by user JWT from consent manager
 */
export const getMyConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceMe(req);

        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Revoke consent by Id
 */
export const revokeConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceRevoke(req);

        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Get consent by id and consent jwt
 */
export const getMyConsentById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceMeConsentById(req);

        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Get user consent
 */
export const getUserConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({
            internalID: userId,
        }).lean();

        if (!user) {
            Logger.error({
                message: 'User not found',
                location: 'getUserConsent',
            });
        }

        if (!user?.userIdentifier) {
            Logger.error({
                message: 'User not has no userIdentifier',
                location: 'getUserConsent',
            });
        }

        const response = await consentServiceGetUserConsent(
            user?.userIdentifier
        );

        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Get user consent By Id
 */
export const getUserConsentById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId, id } = req.params;
        const user = await User.findOne({
            internalID: userId,
        }).lean();

        if (!user) {
            Logger.error({
                message: 'User not found',
                location: 'getUserConsent',
            });
        }

        if (!user.userIdentifier) {
            Logger.error({
                message: 'User not has no userIdentifier',
                location: 'getUserConsent',
            });
        }

        const response = await consentServiceGetUserConsentById(
            user.userIdentifier,
            id
        );

        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Get user privacy notices
 */
export const getUserPrivacyNotices = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceGetPrivacyNotices(req);
        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Get user privacy notices by id
 */
export const getUserPrivacyNoticeById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceGetPrivacyNoticeById(req);
        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Give consent
 */
export const giveConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceGiveConsent(req);

        if (
            req.query.triggerDataExchange === 'true' &&
            !response?.case &&
            response?.case !== 'email-validation-requested'
        ) {
            req.params.consentId = response._id;
            if (req.params.userId) req.params.userId = null;
            const dataExchangeResponse = await consentServiceDataExchange(req);
            return restfulResponse(res, 200, dataExchangeResponse);
        } else {
            return restfulResponse(res, 200, response);
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Trigger the data exchange by the user based on a consent
 */
export const consentDataExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceDataExchange(req);
        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};

/**
 * Get all the available exchanges
 */
export const getAvailableExchanges = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = req.query;
        const { as } = req.params;

        const endpoint = await getEndpoint();

        const response = await consentServiceAvailableExchanges(req);
        if (response.exchanges && response.exchanges.length > 0) {
            response.exchanges = await Promise.all(
                response?.exchanges.map(async (exchange: any) => ({
                    ...exchange,
                    privacyNoticeEndpoint: urlChecker(
                        endpoint,
                        `private/consent/${
                            typeof userId === 'string' ? userId : '{userId}'
                        }/${
                            as === 'provider'
                                ? response.participant.base64SelfDescription
                                : exchange.base64SelfDescription
                        }/${
                            as === 'consumer'
                                ? response.participant.base64SelfDescription
                                : exchange.base64SelfDescription
                        }`
                    ),
                }))
            );
        }

        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(
            res,
            err?.response?.status,
            err?.response?.data ?? err.message
        );
    }
};
