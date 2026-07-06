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
    const response = await axios.post(
        `${dvaUri}/attestation`,
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
    const response = await axios.post(
        `${dvaUri}/attestation/verify`,
        {
            jws,
            attesterDidKey: attesterDid,
        },
        { headers: buildHeaders(apiKey) }
    );
    return response.data;
};