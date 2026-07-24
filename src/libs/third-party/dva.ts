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
    jws: string | null;
    evaluationPassing: boolean;
    evaluationResults: any[];
}

export interface VerifyAttestationRequest {
    dvaUri: string;
    jws: string;
    apiKey?: string;
}

export interface VerifyAttestationResponse {
    verified: boolean;
    reason?: string;
}

function decodeJwsIssuer(jws: string): string | null {
    try {
        const parts = jws.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        return payload?.issuer ?? null;
    } catch {
        return null;
    }
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
    const baseUri = dvaUri.replace(/\/+$/, '');
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
    const { dvaUri, jws, apiKey } = params;
    const baseUri = dvaUri.replace(/\/+$/, '');
    const response = await axios.post(
        `${baseUri}/attestation/verify`,
        { jws },
        { headers: buildHeaders(apiKey) }
    );
    return response.data;
};

export { decodeJwsIssuer };