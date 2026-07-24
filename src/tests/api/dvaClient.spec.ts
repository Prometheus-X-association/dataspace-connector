import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';
import {
    requestAttestation,
    verifyAttestation,
    decodeJwsIssuer,
    AttestationResponse,
    VerifyAttestationResponse,
} from '../../libs/third-party/dva';

const BASE_URL = 'http://dva.example.test';
const SAMPLE_JWS =
    'eyJhbGciOiJFZERTQSIsInR5cCI6IlZDK0xELUpTT04rSldTIn0' +
    '.eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiQXR0ZXN0YXRpb25PZlZlcmFjaXR5Il0sImlzc3VlciI6ImRpZDprZXk6ejZNa2hrYWlnQlpEdm90RGtMNTI1N2ZhaXp0aUdpQzJRdEtMR3Bibm5FR3RhMmRvSyIsInZhbGlkRnJvbSI6IjIwMjQtMDEtMDFUMDA6MDA6MDBaIn0' +
    '.abc123signature';

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
            jws: 'test-jws',
            evaluationPassing: true,
            evaluationResults: [],
        };
        mock.onPost(`${BASE_URL}/attestation`).reply(200, responseBody);

        const result = await requestAttestation({
            dvaUri: BASE_URL,
            vlaId: '570b22e0-2e90-4e02-8c7b-1d6d274629f3',
            exchangeId: 'exchange-123',
            contract: { id: 'contract-1' },
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
            jws: null,
            evaluationPassing: false,
            evaluationResults: [{ quality: 'accuracy', passed: false }],
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

    it('verifyAttestation POSTs only {jws} to the DVA /attestation/verify endpoint', async () => {
        const responseBody: VerifyAttestationResponse = {
            verified: true,
        };
        mock.onPost(`${BASE_URL}/attestation/verify`).reply(
            200,
            responseBody
        );

        const result = await verifyAttestation({
            dvaUri: BASE_URL,
            jws: 'test-jws',
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
        expect(body).to.not.have.property('attesterDidKey');
        expect(result.verified).to.equal(true);
    });

    it('decodeJwsIssuer extracts the issuer did:key from a JWS payload', () => {
        const issuer = decodeJwsIssuer(SAMPLE_JWS);
        expect(issuer).to.equal(
            'did:key:z6MkkhaigBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
        );
    });

    it('decodeJwsIssuer returns null for a malformed JWS', () => {
        expect(decodeJwsIssuer('not.a.jws')).to.equal(null);
        expect(decodeJwsIssuer('onlyonepart')).to.equal(null);
    });
});