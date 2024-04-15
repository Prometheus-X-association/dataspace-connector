import axios from 'axios';
import { Credential } from '../../utils/types/credential';

export const postRepresentation = async (
    method: string,
    endpoint: string,
    data: any,
    credential: string,
    decryptedConsent?: any,
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }
    let consentHeader = {};
    if(decryptedConsent){
        consentHeader = {
            'consentId': decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
        }
    }

    switch (method) {
        case 'none':
            return await axios.post(endpoint, data, {
                headers: consentHeader
            });
        case 'basic':
            return await axios.post(endpoint, {
                ...data,
                username: cred.key,
                password: cred.value,
            }, {
                headers: consentHeader
            });
        case 'apiKey':
            return await axios.post(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                    ...consentHeader,
                },
            });
    }
};

export const putRepresentation = async (
    method: string,
    endpoint: string,
    data: any,
    credential: string,
    decryptedConsent?: any,
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    let consentHeader = {};
    if(decryptedConsent){
        consentHeader = {
            'consentId': decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
        }
    }

    switch (method) {
        case 'none':
            return await axios.put(endpoint, data, {
                headers: consentHeader
            });
        case 'basic':
            return await axios.put(endpoint, {
                ...data,
                // username: cred.key,
                // password: cred.value,
            },
                {
                    headers: consentHeader
                });
        case 'apiKey':
            return await axios.put(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                    ...consentHeader
                },
            });
    }
};

export const getRepresentation = async (
    method: string,
    endpoint: string,
    credential: string,
    decryptedConsent?: any,
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    let consentHeader = {};
    if(decryptedConsent){
        consentHeader = {
            'consentId': decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
        }
    }

    switch (method) {
        case 'none':
            return await axios.get(endpoint, {
                headers: consentHeader
            });
        case 'basic':
            // await axios.get(endpoint, {
            //     username: cred.key,
            //     password: cred.value,
            // });
            break;
        case 'apiKey':
            return await axios.get(endpoint, {
                headers: {
                    [cred.key]: cred.value,
                    ...consentHeader
                },
            });
    }
};

const getCredential = async (credential: string) => {
    return Credential.findById(credential).lean();
};