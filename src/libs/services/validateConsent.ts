import axios from 'axios';
import { decryptSignedConsent } from '../../utils/decryptConsent';
import { ValidationData } from '../../utils/types/validationData';
import { getConsentUri } from '../loaders/configuration';
import { generateBearerTokenFromSecret } from '../jwt';
import { urlChecker } from '../../utils/urlChecker';

/**
 * Verifies with VisionsTrust the validity of the consent and returns user data as well as DataType information and the endpoint to which the data needs to be sent back.
 * @param signedConsent The signed consent as per received from the import service
 * @param encrypted
 * @returns The validation request data
 */
export const validateConsent = async (
    signedConsent: string,
    encrypted: string
) => {
    const { _id, token } = await decryptSignedConsent(signedConsent, encrypted);

    if (!_id || !token)
        throw new Error(
            'Missing critical info consentId or token from the signedConsent'
        );

    const { token: authToken } = await generateBearerTokenFromSecret();

    //move to consent ?
    const validation = await axios({
        method: 'POST',
        url: urlChecker(await getConsentUri(), `consents/${_id}/validate`),
        data: {
            token,
        },
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${authToken}`,
        },
    });

    return validation.data as ValidationData;
};
