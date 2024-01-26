import { readFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IDecryptedConsent } from './types/decryptConsent';

export const decryptSignedConsent = (
    signedConsent: string,
    encrypted?: string
): IDecryptedConsent => {
    const keyPath = path.join(__dirname, '../keys/consentSignature.pem');
    const publicKeyFromFile = readFileSync(keyPath).toString();
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
