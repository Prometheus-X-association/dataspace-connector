import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getConsentUri } from '../../../libs/loaders/configuration';
import { urlChecker } from '../../../utils/urlChecker';
import {User} from "../../../utils/types/user";
import {consentManagerLogin} from "./user.private.controller";

/**
 * Get the Iframe url
 */
export const getIframeURL = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const {privacyNoticeId, userId} = req.query;

        //get user identifier Id
        const user = await User.findOne({ internalID: userId }).lean();

        return restfulResponse(res, 200, {
            url: urlChecker(await getConsentUri(), `consents/pdi/iframe?userIdentifier=${user.userIdentifier}&participant=${await consentManagerLogin()}${privacyNoticeId ? `&privacyNoticeId=${privacyNoticeId}` : ''}`),
        });
    } catch (err) {
        next(err);
    }
};
