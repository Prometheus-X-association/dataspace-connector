import axios from 'axios';
import { Credential } from '../../utils/types/credential';

export const postRepresentation = async (
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
            return await axios.post(endpoint, data);
        case 'basic':
            return await axios.post(endpoint, {
                ...data,
                username: cred.key,
                password: cred.value,
            });
        case 'apiKey':
            return await axios.post(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                },
            });
    }
};

export const putRepresentation = async (
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
            return await axios.put(endpoint, data);
        case 'basic':
            return await axios.put(endpoint, {
                ...data,
                // username: cred.key,
                // password: cred.value,
            });
        case 'apiKey':
            return await axios.put(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                },
            });
    }
};

export const getRepresentation = async (
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
            return await axios.get(endpoint);
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
                },
            });
    }
};

const getCredential = async (credential: string) => {
    return Credential.findById(credential).lean();
};
