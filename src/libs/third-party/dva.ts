import axios from 'axios';

export interface AttestationRequest {
    dvaUri: string;
    vlaId: string;
    exchangeId: string;
    contract: any;
    data: any;
    attesterDid: string;
    apiKey?: string;
}

export interface AttestationResponse {
    requestId: string;
    issuerDidKey: string;
    jws: string | null;
    vcId: string | null;
    evaluationPassing: boolean;
    evaluationResults: any[];
    vcIssuedDate: string | null;
}

export interface VerifyAttestationRequest {
    dvaUri: string;
    jws: string;
    attesterDid: string;
    apiKey?: string;
}

export interface VerifyAttestationResponse {
    verified: boolean;
    reason?: string;
    payload?: any;
}

const buildHeaders = (apiKey?: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
};

export const requestAttestation = async (
    params: AttestationRequest
): Promise<AttestationResponse> => {
    const { dvaUri, vlaId, exchangeId, contract, data, attesterDid, apiKey } =
        params;
    // Strip any trailing slash so we never produce a double-slash URL
    // (e.g. 'http://dva/' + '/attestation' → 'http://dva//attestation').
    const baseUri = dvaUri.trimEnd('/' as unknown as string).replace(/\/+$/, '');
    const response = await axios.post(
        `${baseUri}/attestation`,
        {
            exchangeID: exchangeId,
            contract,
            vlaId,
            data,
            attesterID: attesterDid,
        },
        { headers: buildHeaders(apiKey) }
    );
    return response.data;
};

export const verifyAttestation = async (
    params: VerifyAttestationRequest
): Promise<VerifyAttestationResponse> => {
    const { dvaUri, jws, attesterDid, apiKey } = params;
    // Strip any trailing slash (same reason as requestAttestation above).
    const baseUri = dvaUri.replace(/\/+$/, '');
    const response = await axios.post(
        `${baseUri}/attestation/verify`,
        {
            jws,
            attesterDidKey: attesterDid,
        },
        { headers: buildHeaders(apiKey) }
    );
    return response.data;
};