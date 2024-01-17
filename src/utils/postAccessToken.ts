import axios from 'axios';
import crypto from 'crypto';
import { decryptSignedConsent } from './decryptConsent';
import { generateAuthToken } from './auth';
import { getCatalogUri } from '../libs/loaders/configuration';

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

    const { consentId } = decryptSignedConsent(signedConsent);

    return await postAttachToken(consentId, token);
};

/**
 * Mocks the flow of retrieving a consentId, generating a token and posting it to VisionsTrust.
 * @warning Use this only for testing
 * @param signedConsent The signed consent as per received in the payload of the incoming request
 * @returns The response promise to the request made to VisionsTrust /consents/exchange/token endpoint
 */
export const mockConsentExport = async (signedConsent: string) => {
    const { consentId } = decryptSignedConsent(signedConsent);
    const token = crypto.randomUUID();
    return await postAttachToken(consentId, token);
};

const postAttachToken = async (consentId: string, token: string) => {
    const response = await axios({
        method: 'POST',
        url: (await getCatalogUri()) + '/consents/exchange/token',
        data: {
            consentId,
            token,
        },
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${generateAuthToken()}`,
        },
    });

    return response;
};
