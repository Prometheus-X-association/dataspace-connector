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
} from '../../../libs/services/consent';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';

/**
 * Get consent by user JWT from consent manager
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response.status, err.response.data);
    }
};

/**
 * Get consent by id and consent jwt
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response.status, err.response.data);
    }
};

/**
 * Get user consent
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response.status, err.response.data);
    }
};

/**
 * Get user consent By Id
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response.status, err.response.data);
    }
};

/**
 * Get user privacy notices
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response.status, err.response.data);
    }
};

/**
 * Get user privacy notices by id
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response?.status, err.response?.data);
    }
};

/**
 * Give consent
 * @param req
 * @param res
 * @param next
 */
export const giveConsent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const response = await consentServiceGiveConsent(req);

        if(req.query.triggerDataExchange){
            req.params.consentId = response._id
            if(req.params.userId) req.params.userId = null
            await consentServiceDataExchange(req);
        }
        return restfulResponse(res, 200, response);
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        return restfulResponse(res, err.response?.status, err.response?.data);
    }
};

/**
 * Trigger the data exchange by the user based on a consent
 * @param req
 * @param res
 * @param next
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
        return restfulResponse(res, err.response?.status, err.response?.data);
    }
};
