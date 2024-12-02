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
 * Create a credential
 * @param params
 * @param {CredentialTypeEnum} params.type - Type of the credential
 * @param {string} params.key - Key
 * @param {string} params.value - Value
 */
export const createCredentialService = async (params: {
    type: CredentialTypeEnum;
    key: string;
    value: string;
}) => {
    const { type, key, value } = params;
    return Credential.create({
        _id: new mongoose.Types.ObjectId(),
        type,
        key,
        value,
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
