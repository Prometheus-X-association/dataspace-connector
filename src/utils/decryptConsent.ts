import fs, { readFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IDecryptedConsent } from './types/decryptConsent';
import { getConsentUri } from '../libs/loaders/configuration';
import axios from 'axios';
import { urlChecker } from './urlChecker';
import { Logger } from '../libs/loggers';
import { consentManagerLogin } from '../controllers/private/v1/user.private.controller';

export const decryptSignedConsent = async (
    signedConsent: string,
    encrypted?: string
): Promise<IDecryptedConsent> => {
    let publicKeyFromFile;
    try {
        const keyPath = path.join(__dirname, '../keys/consentSignature.pem');
        publicKeyFromFile = readFileSync(keyPath).toString();
    } catch (error) {
        // If the file doesn't exist, create it with default values and raise error
        if (error.code === 'ENOENT') {
            //login
            const consentJWT = await consentManagerLogin();

            const consentSignatureResponse = await getConsentSignaturePem(
                consentJWT
            );

            const publicKey = atob(consentSignatureResponse.key);

            fs.writeFileSync(
                path.join(__dirname, '..', './keys/consentSignature.pem'),
                publicKey
            );

            const keyPath = path.join(
                __dirname,
                '../keys/consentSignature.pem'
            );
            publicKeyFromFile = readFileSync(keyPath).toString();
        }
    }

    const publicKey = crypto.createPublicKey(publicKeyFromFile);

    const decryptedKey = crypto.publicDecrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(encrypted, 'base64')
    );

    // Convert the decrypted AES key to a buffer
    const aesKeyBuffer = Buffer.from(decryptedKey.toString(), 'hex');

    const textParts = signedConsent.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');

    // Decrypt the data using AES
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        aesKeyBuffer.toString('hex'),
        iv
    );

    const decryptedData = Buffer.concat([
        decipher.update(Buffer.from(encryptedText)),
        decipher.final(),
    ]);

    return JSON.parse(decryptedData.toString('utf-8'));
};

/**
 * get de consentSignaturePEm from consent
 * @param jwt
 */
const getConsentSignaturePem = async (jwt: string) => {
    try {
        if (!(await getConsentUri())) {
            throw Error('Consent URI not setup.');
        }
        const res = await axios.get(
            urlChecker(await getConsentUri(), 'participants/consent-signature'),
            {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            }
        );

        if (!res) {
            throw Error('User registration error.');
        }

        return res.data;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};
