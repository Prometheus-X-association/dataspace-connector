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
import { User } from '../../utils/types/user';

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
        await getUserIdentifier(req);
        const { userId, providerSd, consumerSd } = req.params;

        const response = await axios.get(
            await verifyConsentUri(
                `consents/${userId}/${providerSd}/${consumerSd}`
            ),
            {
                headers: {
                    'x-user-key': userId,
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
        await getUserIdentifier(req);
        const { userId, privacyNoticeId } = req.params;
        const response = await axios.get(
            await verifyConsentUri(
                `consents/privacy-notices/${privacyNoticeId}`
            ),
            {
                headers: {
                    'x-user-key': userId,
                },
            }
        );

        const [contractResp, dataProviderResp,  ...dataResponses] = await Promise.all([
            axios.get(response?.data?.contract),
            axios.get(response?.data?.dataProvider),
            ...response?.data?.data.map((dt: string) => axios.get(dt)),
            ...response?.data?.recipients.map((dt: string) => axios.get(dt))
        ])

        const dataResponsesMap = dataResponses?.map(dt => dt?.data);

        if(contractResp.status === 200 && contractResp.data) response.data.contract = contractResp.data;
        if(dataProviderResp.status === 200 && dataProviderResp.data) response.data.dataProvider = dataProviderResp.data;
        if(dataResponsesMap.length > 0 ) response.data.data = dataResponsesMap.filter(data => data['@type'] === 'ServiceOffering');
        if(dataResponsesMap.length > 0) response.data.recipients = dataResponsesMap.filter(data => data['@type'] === 'Participant');

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
        await getUserIdentifier(req);
        const response = await axios.post(
            await verifyConsentUri('consents'),
            { ...req.body },
            {
                headers: {
                    'x-user-key': req.params.userId,
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
        await getUserIdentifier(req);
        const { consentId } = req.params;
        const response = await axios.post(
            await verifyConsentUri(`consents/${consentId}/data-exchange`),
            {},
            {
                headers: {
                    'x-user-key': req.params.userId,
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
 * @param req
 */
export const consentServiceMe = async (req: Request) => {
    try {
        await getUserIdentifier(req);
        const response = await axios.get(
            await verifyConsentUri('consents/me'),
            {
                headers: {
                    'x-user-key': req.params.userId,
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
 * @param req
 */
export const consentServiceMeConsentById = async (req: Request) => {
    try {
        await getUserIdentifier(req);
        const response = await axios.get(
            await verifyConsentUri(`consents/me/${req.params.id}`),
            {
                headers: {
                    'x-user-key': req.params.userId,
                },
            }
        );

        const [contractResp,  dataResponses, recipientsResponses, purposesResponses] = await Promise.all([
            axios.get(response?.data?.contract),
            ...response?.data?.data.map((dt: string) => axios.get(dt)),
            ...response?.data?.recipients.map((dt: string) => axios.get(dt)),
            ...response?.data?.purposes.map((dt: any) => axios.get(dt?.purpose))
        ])

        if(contractResp.status === 200 && contractResp.data) response.data.contract = contractResp.data;
        if(dataResponses.status === 200 && dataResponses.data ) response.data.data = dataResponses.data;
        if(recipientsResponses.status === 200 && recipientsResponses.data ) response.data.recipients = recipientsResponses.data;
        if(purposesResponses.status === 200 && purposesResponses.data) response.data.purposes = purposesResponses.data;

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
 * use the /exchanges/:as route of the consent manager
 * @param req
 */
export const consentServiceAvailableExchanges = async (req: Request) => {
    try {
        const response = await axios.get(
            await verifyConsentUri(`consents/exchanges/${req.params.as}`),
            await verifyConsentAuth()
        );
        return response?.data;
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

const getUserIdentifier = async (req: Request) => {
    const { userId: userIdParams } = req.params;
    const { userId: userIdBody } = req.body;
    let userId;

    if (userIdParams) userId = userIdParams;
    else if (userIdBody) userId = userIdBody;

    if (!userId) {
        Logger.error({
            message: 'No userId find in params',
            location: 'getUserPrivacyNotices',
        });
        throw new Error('No userId find in params');
    }
    const user = await User.findOne({
        internalID: userId,
    }).lean();

    if (!user) {
        Logger.error({
            message: 'User not found',
            location: 'getUserPrivacyNotices',
        });
        throw new Error('User not found');
    }

    if (!user?.userIdentifier) {
        Logger.error({
            message: 'UserIdentifier not found',
            location: 'getUserPrivacyNotices',
        });
        throw new Error('UserIdentifier not found');
    }

    req.params.userId = user.userIdentifier;
    return req;
};
