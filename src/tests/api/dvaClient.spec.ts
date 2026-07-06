import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';
import {
    requestAttestation,
    verifyAttestation,
    AttestationResponse,
    VerifyAttestationResponse,
} from '../../libs/third-party/dva';

const BASE_URL = 'http://dva.example.test';

describe('DVA client', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    it('requestAttestation POSTs to the DVA /attestation endpoint and returns the JWS on success', async () => {
        const responseBody: AttestationResponse = {
            requestId: 'req-1',
            issuerDidKey: 'did:example:issuer',
            jws: 'test-jws',
            vcId: 'vc-1',
            evaluationPassing: true,
            evaluationResults: [],
            vcIssuedDate: null,
        };
        mock.onPost(`${BASE_URL}/attestation`).reply(200, responseBody);

        const result = await requestAttestation({
            dvaUri: BASE_URL,
            vlaId: '570b22e0-2e90-4e02-8c7b-1d6d274629f3',
            exchangeId: 'exchange-123',
            contract: { id: 'contract-1', vla: { schema: [] } },
            data: { foo: 'bar' },
            attesterDid: 'did:example:attester',
            apiKey: 'secret-api-key',
        });

        expect(mock.history.post.length).to.equal(1);
        const req = mock.history.post[0];
        expect(req.url).to.equal(`${BASE_URL}/attestation`);
        expect(req.headers).to.have.property(
            'Authorization',
            'Bearer secret-api-key'
        );
        const body = JSON.parse(req.data);
        expect(body).to.have.property('exchangeID', 'exchange-123');
        expect(body).to.have.property(
            'vlaId',
            '570b22e0-2e90-4e02-8c7b-1d6d274629f3'
        );
        expect(body).to.have.property('attesterID', 'did:example:attester');
        expect(body).to.have.property('contract');
        expect(body).to.have.property('data');
        expect(result.jws).to.equal('test-jws');
        expect(result.evaluationPassing).to.equal(true);
    });

    it('requestAttestation returns null JWS when evaluation fails', async () => {
        const responseBody: AttestationResponse = {
            requestId: 'req-2',
            issuerDidKey: 'did:example:issuer',
            jws: null,
            vcId: null,
            evaluationPassing: false,
            evaluationResults: [{ quality: 'accuracy', passed: false }],
            vcIssuedDate: null,
        };
        mock.onPost(`${BASE_URL}/attestation`).reply(200, responseBody);

        const result = await requestAttestation({
            dvaUri: BASE_URL,
            vlaId: 'vla-fail',
            exchangeId: 'exchange-456',
            contract: { id: 'contract-2' },
            data: {},
            attesterDid: 'did:example:attester',
        });

        expect(mock.history.post.length).to.equal(1);
        expect(mock.history.post[0].headers).to.not.have.property(
            'Authorization'
        );
        expect(result.jws).to.equal(null);
        expect(result.evaluationPassing).to.equal(false);
        expect(result.evaluationResults).to.be.an('array').with.lengthOf(1);
    });

    it('verifyAttestation POSTs to the DVA /attestation/verify endpoint and returns {verified: true}', async () => {
        const responseBody: VerifyAttestationResponse = {
            verified: true,
            payload: { ok: true },
        };
        mock.onPost(`${BASE_URL}/attestation/verify`).reply(
            200,
            responseBody
        );

        const result = await verifyAttestation({
            dvaUri: BASE_URL,
            jws: 'test-jws',
            attesterDid: 'did:example:attester',
            apiKey: 'secret-api-key',
        });

        expect(mock.history.post.length).to.equal(1);
        const req = mock.history.post[0];
        expect(req.url).to.equal(`${BASE_URL}/attestation/verify`);
        expect(req.headers).to.have.property(
            'Authorization',
            'Bearer secret-api-key'
        );
        const body = JSON.parse(req.data);
        expect(body).to.have.property('jws', 'test-jws');
        expect(body).to.have.property(
            'attesterDidKey',
            'did:example:attester'
        );
        expect(result.verified).to.equal(true);
        expect(result.payload).to.deep.equal({ ok: true });
    });
});