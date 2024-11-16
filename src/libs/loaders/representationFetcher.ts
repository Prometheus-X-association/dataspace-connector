import axios from 'axios';
import { Credential } from '../../utils/types/credential';
import { Regexes } from '../../utils/regexes';
import { IDataExchange } from '../../utils/types/dataExchange';
import { paramsMapper } from '../../utils/paramsMapper';
import { handle } from './handler';
import { User } from '../../utils/types/user';

export const postRepresentation = async (
    method: string,
    endpoint: string,
    data: any,
    credential: string,
    decryptedConsent?: any
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }
    let consentHeader = {};
    if (decryptedConsent) {
        consentHeader = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider
                ?.selfDescriptionURL,
        };
    }

    switch (method) {
        case 'none':
            return await axios.post(endpoint, data, {
                headers: consentHeader,
            });
        case 'basic':
            return await axios.post(
                endpoint,
                {
                    ...data,
                    username: cred.key,
                    password: cred.value,
                },
                {
                    headers: consentHeader,
                }
            );
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
    decryptedConsent?: any
) => {
    let cred;

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    let consentHeader = {};
    if (decryptedConsent) {
        consentHeader = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataProvider
                ?.selfDescriptionURL,
        };
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
                    // username: cred.key,
                    // password: cred.value,
                },
                {
                    headers: consentHeader,
                }
            );
        case 'apiKey':
            return await axios.put(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
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

    if (credential && method !== 'none') {
        cred = await getCredential(credential);
    }

    let consentHeader = {};
    if (decryptedConsent) {
        consentHeader = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataConsumer
                ?.selfDescriptionURL,
        };
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
                    [cred.key]: cred.value,
                    ...consentHeader,
                },
            });
    }
};

/**
 * Post or Put data to given representation
 * @param params
 * @return Promise<any>
 */
export const postOrPutRepresentation = async (params: {
    representationUrl: string;
    data: any;
    method: string;
    verb: string;
    credential?: string;
    user?: string;
    decryptedConsent?: any;
}) => {
    const { representationUrl, data, method, credential, verb } = params;
    // if contains params in URL is PUT Method
    if (params.representationUrl.match(Regexes.userIdParams)) {
        if (params.data._id) delete params.data._id;

        // replace params between {} by id in consent
        const url = params.representationUrl.replace(
            Regexes.userIdParams,
            () => {
                return params.user;
            }
        );

        const [updateData] = await handle(
            putRepresentation(
                params.method,
                url,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return updateData;
    } else if (params.representationUrl.match(Regexes.urlParams)) {
        const user = await User.findOne({ internalID: params.user }).lean();
        // replace params between {url} by id in consent
        const url = params.representationUrl.replace(Regexes.urlParams, () => {
            return user.url;
        });

        const [postData] = await handle(
            postRepresentation(
                params.method,
                url,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return postData;
    }
    //else we POST data
    else {
        switch (verb) {
            case 'POST': {
                const [postData] = await handle(
                    postRepresentation(
                        method,
                        representationUrl,
                        data,
                        credential
                    )
                );

                return postData;
            }
            case 'PUT': {
                const [updateData] = await handle(
                    putRepresentation(
                        method,
                        representationUrl,
                        data,
                        credential
                    )
                );

                return updateData;
            }
            default: {
                const [postData] = await handle(
                    postRepresentation(
                        method,
                        representationUrl,
                        data,
                        credential
                    )
                );

                return postData;
            }
        }
    }
};

const getCredential = async (credential: string) => {
    return Credential.findById(credential).lean();
};
