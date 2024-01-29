import axios from 'axios';
import crypto from 'crypto';
import { decryptSignedConsent } from '../../utils/decryptConsent';
import { getConsentUri } from '../loaders/configuration';
import { generateBearerTokenFromSecret } from '../jwt';

const TOKEN_MAX_LENGTH = 50;

/**
 * POSTs the access token generated to VisionsTrust
 * @param consentId The consentId obtained from decrypting the signedConsent from the request payload
 * @param token The 50 max characters access token you generate
 * @returns The response promiseto the request made to VisionsTrust /consents/exchange/token endpoint
 */
export const postAccessToken = async (consentId: string, token: string) => {
    if (token.length >= TOKEN_MAX_LENGTH)
        throw new Error('Token too large. Token must be of 50 characters max.');

    return await postAttachToken(consentId, token);
};

/**
 * POSTs the access token generated to VisionsTrust without needing to manually retrieve the consentId from the signedConsent.
 * You can use this method if you don't care about any other information inside the signedConsent's content.
 * @param signedConsent The signedConsent as per received in the payload of the incoming request
 * @param token The 50 max characters access token you generate
 * @returns The response promise to the request made to VisionsTrust /consents/exchange/token endpoint
 */
export const postAccessTokenWithSignedConsent = async (
    signedConsent: string,
    token: string
) => {
    if (token.length >= TOKEN_MAX_LENGTH)
        throw new Error('Token too large. Token must be of 50 characters max.');

    const { _id } = decryptSignedConsent(signedConsent);

    return await postAttachToken(_id, token);
};

/**
 * Mocks the flow of retrieving a consentId, generating a token and posting it to VisionsTrust.
 * @warning Use this only for testing
 * @param signedConsent The signed consent as per received in the payload of the incoming request
 * @returns The response promise to the request made to VisionsTrust /consents/exchange/token endpoint
 */
export const mockConsentExport = async (signedConsent: string) => {
    const { _id } = decryptSignedConsent(signedConsent);
    const token = crypto.randomUUID();
    return await postAttachToken(_id, token);
};

const postAttachToken = async (consentId: string, token: string) => {
    const { token: authToken } = await generateBearerTokenFromSecret();

    return axios({
        method: 'POST',
        url: `${await getConsentUri()}consents/${consentId}/token`,
        data: {
            token,
        },
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${authToken}`,
        },
    });
};
