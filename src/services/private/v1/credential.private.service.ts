import { Credential, ICredential } from '../../../utils/types/credential';
import mongoose from 'mongoose';
import { CredentialTypeEnum } from '../../../utils/enums/credentialTypeEnum';

/**
 * Return all the credentials
 * @return Promise<ICredential[]>
 */
export const getCredentialsServices = async (): Promise<ICredential[]> => {
    return Credential.find().lean();
};

/**
 * Return a credential by his ID
 * @param {string} id - ID of the credential
 * @return Promise<ICredential>
 */
export const getCredentialByIdService = async (
    id: string
): Promise<ICredential> => {
    return Credential.findById(id).lean();
};

/**
 * Return a credential or multiple credentials by their IDs
 * @param credential
 */
export const getCredential = async (credential: string) => {
    let credentialResponse = [];
    if (credential.includes(',')) {
        const creds = credential.split(',');
        credentialResponse = await Credential.find({
            _id: {
                $in: creds,
            },
        });
    } else {
        credentialResponse.push(await Credential.findById(credential).lean());
    }

    return {credentialResponse, isS3: credentialResponse.some(cred => cred.type === 's3') };
};

/**
 * Create a credential
 * @param params
 * @param {CredentialTypeEnum} params.type - Type of the credential
 * @param {string} params.key - Key
 * @param {string} params.value - Value
 */
export const createCredentialService = async (params: {
    type: CredentialTypeEnum;
    key?: string;
    value?: string;
    content?: object;
}) => {
    const { type, key, value, content } = params;
    return Credential.create({
        _id: new mongoose.Types.ObjectId(),
        type,
        key,
        value,
        content,
    });
};

/**
 * Update a credential by ID
 * @param params
 * @param {CredentialTypeEnum} params.type - Type of the credential
 * @param {string} params.key - Key
 * @param {string} params.value - Value
 * @return ICredential
 */
export const updateCredentialService = async (params: {
    id: string;
    type: CredentialTypeEnum;
    key: string;
    value: string;
}): Promise<ICredential> => {
    const { id, type, key, value } = params;
    return Credential.findByIdAndUpdate(
        id,
        {
            type,
            key,
            value,
        },
        {
            new: true,
        }
    );
};
