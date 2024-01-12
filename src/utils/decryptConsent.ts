import {readFileSync} from 'fs';
import path from 'path';
import crypto from 'crypto';
import {IDecryptedConsent} from "./types/decryptConsent";

export const decryptSignedConsent = (
    signedConsent: string
): IDecryptedConsent => {
    const keyPath = path.join(__dirname, '../keys/rsa-public.pem');
    const publicKeyFromFile = readFileSync(keyPath).toString();
    const publicKey = crypto.createPublicKey(publicKeyFromFile);

    const decryptedData = crypto.publicDecrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(signedConsent, 'base64')
    );

    return JSON.parse(decryptedData.toString());
};