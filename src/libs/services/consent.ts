import { Logger } from '../loggers';
import axios from 'axios';
import {
    getConsentUri,
    getSecretKey,
    getServiceKey,
} from '../loaders/configuration';
import { urlChecker } from '../../utils/urlChecker';
import { Configuration } from '../../utils/types/configuration';
import { Request } from 'express';
import { decryptJWT } from '../../utils/decryptJWT';

/**
 * use the /consents/:userId route of the consent manager
 * @param userId
 */
export const consentServiceGetUserConsent = async (userId: string) => {
    try {
        const response = await axios.get(
            await verifyConsentUri(`consents/participants/${userId}`),
            await verifyConsentAuth()
        );
        return response.data.consents;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/:userId/:id route of the consent manager
 * @param userId
 * @param id
 */
export const consentServiceGetUserConsentById = async (
    userId: string,
    id: string
) => {
    try {
        const response = await axios.get(
            await verifyConsentUri(`consents/participants/${userId}/${id}`),
            await verifyConsentAuth()
        );

        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/:userId/:providerId/:consumerId route of the consent manager
 * @param req
 */
export const consentServiceGetPrivacyNotices = async (req: Request) => {
    try {
        const { userId, providerId, consumerId } = req.params;
        const response = await axios.get(
            await verifyConsentUri(
                `consents/${userId}/${providerId}/${consumerId}`
            ),
            {
                headers: {
                    Authorization: req.header('Authorization'),
                },
            }
        );

        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/:privacyNoticeId route of the consent manager
 * @param req
 */
export const consentServiceGetPrivacyNoticeById = async (req: Request) => {
    try {
        const { privacyNoticeId } = req.params;
        const response = await axios.get(
            await verifyConsentUri(
                `consents/privacy-notices/${privacyNoticeId}`
            ),
            {
                headers: {
                    Authorization: req.header('Authorization'),
                },
            }
        );
        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/:id route of the consent manager
 * @param req
 */
export const consentServiceGiveConsent = async (req: Request) => {
    try {
        const response = await axios.post(
            await verifyConsentUri('consents'),
            { ...req.body },
            {
                headers: {
                    Authorization: req.header('Authorization'),
                },
            }
        );

        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/:consentId/data-exchange route of the consent manager
 * @param req
 */
export const consentServiceDataExchange = async (req: Request) => {
    try {
        const { consentId } = req.params;
        const response = await axios.post(
            await verifyConsentUri(`consents/${consentId}/data-exchange`),
            {},
            {
                headers: {
                    Authorization: req.header('Authorization'),
                },
            }
        );

        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /users/login route of the consent manager
 * Log the user in the consent manager
 * @param email
 * @param password
 */
export const consentServiceUserLogin = async (
    email: string,
    password: string
) => {
    try {
        const response = await axios.post(
            await verifyConsentUri('users/login'),
            {
                email,
                password,
            }
        );
        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/me route of the consent manager
 * @param token
 */
export const consentServiceMe = async (token: string) => {
    try {
        const response = await axios.get(
            await verifyConsentUri('consents/me'),
            {
                headers: {
                    Authorization: token,
                },
            }
        );
        return response.data.consents;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * use the /consents/me/:id route of the consent manager
 * @param token
 * @param id
 */
export const consentServiceMeConsentById = async (
    token: string,
    id: string
) => {
    try {
        const response = await axios.get(
            await verifyConsentUri(`consents/me/${id}`),
            {
                headers: {
                    Authorization: token,
                },
            }
        );
        return response.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * Log the participant in the consent manager
 */
export const consentServiceParticipantLogin = async () => {
    try {
        const loginResponse = await axios.post(
            await verifyConsentUri('participants/login'),
            {
                clientID: await getServiceKey(),
                clientSecret: await getSecretKey(),
            }
        );

        await Configuration.findOneAndUpdate(
            {},
            {
                consentJWT: loginResponse.data.jwt,
            }
        );

        return loginResponse.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        throw e;
    }
};

/**
 * Check if the consent URI is configured and check URI string
 * @param route
 */
const verifyConsentUri = async (route: string) => {
    const uri = await getConsentUri();
    if (!uri) {
        Logger.error({
            message: 'No valid consent URI',
            location: 'Consent service',
        });
    }
    return urlChecker(uri, route);
};

/**
 * Check if the participant need to be login in the consent manager
 */
const verifyConsentAuth = async () => {
    try {
        let conf = await Configuration.findOne({}).lean();
        //check if doesn't exist
        if (!conf.consentJWT) {
            await consentServiceParticipantLogin();
            conf = await Configuration.findOne({}).lean();
        }

        //check if token is valid
        if (!verifyConsentJWTValidity(conf.consentJWT)) {
            await consentServiceParticipantLogin();
            conf = await Configuration.findOne({}).lean();
        }

        return {
            headers: {
                Authorization: `Bearer ${conf.consentJWT}`,
            },
        };
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};

/**
 * Check the date validity of the participant consent JWT stored in database
 * @param jwt
 */
const verifyConsentJWTValidity = (jwt: string) => {
    const decodedJWT = decryptJWT(jwt);

    const yourDate = new Date(decodedJWT.exp * 1000);

    const currentDate = new Date();

    if (yourDate > currentDate) {
        return true;
    } else if (yourDate < currentDate) {
        return false;
    }
};
