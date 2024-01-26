import axios from 'axios';
import { ConsentImportPayload } from './types/consentImportPayload';

/**
 * POSTs a data request using the signed consent containing the access token
 * @param payload The payload received from VisionsTrust to your consent/import endpoint
 * @returns The response promise made to the Export Service
 */
export const postDataRequest = async (payload: ConsentImportPayload) => {
    return await axios({
        method: 'POST',
        url: payload.dataProviderEndpoint,
        data: {
            ...payload,
        },
        headers: {
            'content-type': 'application/json',
        },
    });
};
