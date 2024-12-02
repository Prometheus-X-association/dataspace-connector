import axios from 'axios';
import { Regexes } from '../../utils/regexes';
import { IDataExchange } from '../../utils/types/dataExchange';
import { paramsMapper } from '../../utils/paramsMapper';
import { handle } from './handler';
import { User } from '../../utils/types/user';
import { getCredentialByIdService } from '../../services/private/v1/credential.private.service';

/**
 * POST data to given representation URL
 * @param {Object} params
 * @param {string} params.endpoint - URL of the representation
 * @param {string} params.method - none | basic | apiKey
 * @param {string} params.credential - id of the credential
 * @param params.data - the data that will be sent through the body payload
 * @param params.decryptedConsent - Decrypted consent
 * @param {IDataExchange} params.dataExchange - Data Exchange
 * @return Promise<any>
 */
export const postRepresentation = async (params: {
    method: string;
    endpoint: string;
    data: any;
    credential: string;
    decryptedConsent?: any;
    dataExchange?: IDataExchange;
}) => {
    const {
        method,
        endpoint,
        data,
        credential,
        decryptedConsent,
        dataExchange,
    } = params;

    let cred;

    if (credential && method !== 'none') {
        cred = await getCredentialByIdService(credential);
    }

    // Process headers
    const headers = headerProcessing({
        decryptedConsent,
        dataExchange,
    });

    switch (method) {
        case 'none':
            return await axios.post(endpoint, data, {
                headers: headers,
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
                    headers: headers,
                }
            );
        case 'apiKey':
            return await axios.post(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                    ...headers,
                },
            });
    }
};

/**
 * PUT data to given representation URL
 * @param {Object} params
 * @param {string} params.endpoint - URL of the representation
 * @param {string} params.method - none | basic | apiKey
 * @param {string} params.credential - id of the credential
 * @param params.data - the data that will be sent through the body payload
 * @param params.decryptedConsent - Decrypted consent
 * @param {IDataExchange} params.dataExchange - Data Exchange
 * @return Promise<any>
 */
export const putRepresentation = async (params: {
    method: string;
    endpoint: string;
    data: any;
    credential: string;
    decryptedConsent?: any;
    dataExchange?: IDataExchange;
}) => {
    const {
        method,
        endpoint,
        data,
        credential,
        decryptedConsent,
        dataExchange,
    } = params;

    let cred;

    if (credential && method !== 'none') {
        cred = await getCredentialByIdService(credential);
    }

    // Process headers
    const headers = headerProcessing({
        decryptedConsent,
        dataExchange,
    });

    switch (method) {
        case 'none':
            return await axios.put(endpoint, data, {
                headers: headers,
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
                    headers: headers,
                }
            );
        case 'apiKey':
            return await axios.put(endpoint, data, {
                headers: {
                    [cred.key]: cred.value,
                    ...headers,
                },
            });
    }
};

/**
 * GET the representation by making a GET request to the representation URL
 * @param {Object} params
 * @param {string} params.resource - Self description URL of the resource
 * @param {string} params.method - none | basic | apiKey
 * @param {string} params.endpoint - URL of the representation where the request will be made
 * @param {string} params.credential - id of the credential
 * @param params.decryptedConsent - Decrypted consent
 * @param {string[]} params.representationQueryParams - Query params added to the get request
 * @param {IDataExchange} params.dataExchange - Data Exchange
 * @return Promise<any>
 */
export const getRepresentation = async (params: {
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
    } = params;

    let cred;

    if (credential && method !== 'none') {
        cred = await getCredentialByIdService(credential);
    }

    // Process headers
    const headers = headerProcessing({
        decryptedConsent,
        dataExchange,
    });

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
                headers: headers,
            });
        case 'apiKey':
            return await axios.get(url, {
                headers: {
                    [cred.key]: cred.value,
                    ...headers,
                },
            });
    }
};

/**
 * POST or PUT data to given representation
 * @param {Object} params
 * @param {string} params.representationUrl - URL of the representation
 * @param {string} params.method - none | basic | apiKey
 * @param {string} params.verb - POST | PUT | GET | DELETE | PATCH
 * @param {string} params.credential - id of the credential
 * @param {string} params.user - id of the user
 * @param params.data - the data that will be sent through the body payload
 * @param params.decryptedConsent - Decrypted consent
 * @param {IDataExchange} params.dataExchange - Data Exchange
 * @return Promise<any>
 */
export const postOrPutRepresentation = async (params: {
    representationUrl: string;
    data: any;
    method: string;
    verb?: string;
    credential?: string;
    user?: string;
    decryptedConsent?: any;
    dataExchange?: IDataExchange;
}) => {
    const {
        representationUrl,
        data,
        method,
        credential,
        verb,
        decryptedConsent,
        dataExchange,
    } = params;
    // if contains params in URL is PUT Method
    if (representationUrl.match(Regexes.userIdParams)) {
        if (data._id) delete data._id;

        // replace params between {} by id in consent
        const url = representationUrl.replace(Regexes.userIdParams, () => {
            return params.user;
        });

        const [updateData] = await handle(
            putRepresentation({
                method,
                endpoint: url,
                data,
                credential,
                decryptedConsent,
                dataExchange,
            })
        );

        return updateData;
    } else if (representationUrl.match(Regexes.urlParams)) {
        const user = await User.findOne({ internalID: params.user }).lean();
        // replace params between {url} by id in consent
        const url = params.representationUrl.replace(Regexes.urlParams, () => {
            return user.url;
        });

        const [postData] = await handle(
            postRepresentation({
                method,
                endpoint: url,
                data,
                credential,
                decryptedConsent,
                dataExchange,
            })
        );

        return postData;
    }
    //else we POST data
    else {
        switch (verb) {
            case 'POST': {
                const [postData] = await handle(
                    postRepresentation({
                        method,
                        endpoint: representationUrl,
                        data,
                        credential,
                        dataExchange,
                    })
                );

                return postData;
            }
            case 'PUT': {
                const [updateData] = await handle(
                    putRepresentation({
                        method,
                        endpoint: representationUrl,
                        data,
                        credential,
                        dataExchange,
                    })
                );

                return updateData;
            }
            default: {
                const [postData] = await handle(
                    postRepresentation({
                        method,
                        endpoint: representationUrl,
                        data,
                        credential,
                        dataExchange,
                    })
                );

                return postData;
            }
        }
    }
};

/**
 * Process the header of the request made to the representation URL
 * @param {Object} params consent and dataExchange
 * @param {Object} params.decryptedConsent - Decrypted consent
 * @param {IDataExchange} params.dataExchange - Data exchange
 * @param params consent and dataExchange
 * @return object
 */
const headerProcessing = (params: {
    decryptedConsent?: any;
    dataExchange?: IDataExchange;
}): object => {
    const { decryptedConsent, dataExchange } = params;

    let headers = {};
    if (decryptedConsent) {
        headers = {
            consentId: decryptedConsent?._id,
            'consent-id': decryptedConsent?._id,
            'x-ptx-consent-id': decryptedConsent?._id,
            'x-interlocutor-connector': (decryptedConsent as any)?.dataConsumer
                ?.selfDescriptionURL,
        };
    }

    if (dataExchange) {
        headers = {
            ...headers,
            'x-ptx-incomingDataspaceConnectorURI': dataExchange.consumerEndpoint
                ? dataExchange.consumerEndpoint
                : dataExchange.providerEndpoint,
            'x-ptx-dataExchangeId': dataExchange?._id,
            'x-ptx-contractId': dataExchange.contract.split('/').pop(),
            'x-ptx-contractURL': dataExchange.contract,
        };
    }

    return headers;
};
