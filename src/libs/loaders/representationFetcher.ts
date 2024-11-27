import axios from 'axios';
import { Credential } from '../../utils/types/credential';
import { Regexes } from '../../utils/regexes';
import { IDataExchange } from '../../utils/types/dataExchange';
import { paramsMapper } from '../../utils/paramsMapper';

export const postRepresentation = async (
    method: string,
    endpoint: string,
    data: any,
    credential: string,
    decryptedConsent?: any
) => {
    let cred;

    let consentHeader: Record<string, string> = {};
    if (decryptedConsent) {
        consentHeader = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider
                ?.selfDescriptionURL,
        };
    }

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
        // Loop through the cred array to dynamically add headers
        cred.forEach(({ key, value }) => {
            consentHeader[key] = value;
        });
    }

    switch (method) {
        case 'none':
            return await axios.post(endpoint, data, {
                headers: consentHeader,
            });
        case 'apiKey':
            return await axios.post(endpoint, data, {
                headers: {
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
    decryptedConsent?: any
) => {
    let cred;

    let consentHeader: Record<string, string> = {};
    if (decryptedConsent) {
        consentHeader = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider
                ?.selfDescriptionURL,
        };
    }

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
        // Loop through the cred array to dynamically add headers
        cred.forEach(({ key, value }) => {
            consentHeader[key] = value;
        });
    }

    switch (method) {
        case 'none':
            return await axios.put(endpoint, data, {
                headers: consentHeader,
            });
        case 'basic':
            return await axios.put(
                endpoint,
                {
                    ...data,
                },
                {
                    headers: consentHeader,
                }
            );
        case 'apiKey':
            return await axios.put(endpoint, data, {
                headers: {
                    ...consentHeader,
                },
            });
    }
};

export const getRepresentation = async (props: {
    resource?: any;
    method: string;
    endpoint: string;
    credential: string;
    decryptedConsent?: any;
    representationQueryParams?: string[];
    dataExchange?: IDataExchange;
}) => {
    const {
        resource,
        method,
        endpoint,
        credential,
        decryptedConsent,
        representationQueryParams,
        dataExchange,
    } = props;

    let cred;

    let consentHeader: Record<string, string> = {};
    if (decryptedConsent) {
        consentHeader = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataConsumer
                ?.selfDescriptionURL,
        };
    }

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
        // Loop through the cred array to dynamically add headers
        cred.forEach(({ key, value }) => {
            consentHeader[key] = value;
        });
    }

    let url;

    if (endpoint.match(Regexes.userIdParams)) {
        url = endpoint.replace(Regexes.userIdParams, () => {
            return (decryptedConsent as any).providerUserIdentifier.identifier;
        });
    } else if (endpoint.match(Regexes.urlParams)) {
        url = endpoint.replace(Regexes.urlParams, () => {
            return (decryptedConsent as any).providerUserIdentifier.url;
        });
    } else {
        url = endpoint;
    }

    if (representationQueryParams?.length > 0) {
        const { url: urlWithParams } = await paramsMapper({
            resource,
            representationQueryParams,
            dataExchange,
            url,
        });
        url = urlWithParams;
    }

    switch (method) {
        case 'none':
            return await axios.get(url, {
                headers: consentHeader,
            });
        case 'apiKey':
            return await axios.get(url, {
                headers: {
                    ...consentHeader,
                },
            });
    }
};

const getCredential = async (credential: string) => {
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

    return credentialResponse;
};
