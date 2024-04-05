import axios from 'axios';
import { Credential } from '../../utils/types/credential';

export const postRepresentation = async (
    decryptedConsent: any,
    method: string,
    endpoint: string,
    data: any,
    credential: string
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    switch (method) {
        case 'none':
            return await axios.post(endpoint, data, {
                headers: {
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
                }
            });
        case 'basic':
            return await axios.post(endpoint, {
                ...data,
                username: cred.key,
                password: cred.value,
            }, {
                headers: {
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
                }
            });
        case 'apiKey':
            return await axios.post(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
                },
            });
    }
};

export const putRepresentation = async (
    decryptedConsent: any,
    method: string,
    endpoint: string,
    data: any,
    credential: string
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    switch (method) {
        case 'none':
            return await axios.put(endpoint, data, {
                headers: {
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
                }
            });
        case 'basic':
            return await axios.put(endpoint, {
                ...data,
                // username: cred.key,
                // password: cred.value,
            },
                {
                    headers: {
                        'consentId': decryptedConsent?._id,
                        'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
                    }
                });
        case 'apiKey':
            return await axios.put(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider?.selfDescriptionURL,
                },
            });
    }
};

export const getRepresentation = async (
    decryptedConsent: any,
    method: string,
    endpoint: string,
    credential: string
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    switch (method) {
        case 'none':
            return await axios.get(endpoint, {
                headers: {
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataConsumer?.selfDescriptionURL,
                }
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
                    'consentId': decryptedConsent?._id,
                    'x-interlocutor-connector': (decryptedConsent as any)?.dataConsumer?.selfDescriptionURL,
                },
            });
    }
};

const getCredential = async (credential: string) => {
    return Credential.findById(credential).lean();
};
