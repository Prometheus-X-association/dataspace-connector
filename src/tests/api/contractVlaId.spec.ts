import { expect } from 'chai';
import { ContractResponseType } from '../../utils/responses/contract.response';
import { BilateralResponseType } from '../../utils/responses/bilateral.response';

describe('Contract VLA ID field', () => {
  it('should parse an ecosystem contract WITH vlaId', () => {
    const contract = {
      _id: 'abc123',
      ecosystem: 'eco',
      orchestrator: 'did:orch',
      rolesAndObligations: [],
      status: 'pending',
      serviceOfferings: [],
      purpose: [],
      members: [],
      revokedMembers: [],
      serviceChains: [],
      useDVCT: false,
      vlaId: '570b22e0-2e90-4e02-8c7b-1d6d274629f3',
      createdAt: '2026-07-04T22:00:00.000Z',
      updatedAt: '2026-07-04T22:00:00.000Z',
      __v: 0,
    } as ContractResponseType;

    expect(contract.vlaId).to.equal('570b22e0-2e90-4e02-8c7b-1d6d274629f3');
    expect(typeof contract.vlaId).to.equal('string');
  });

  it('should parse an ecosystem contract WITHOUT vlaId (optional)', () => {
    const contract = {
      _id: 'abc124',
      ecosystem: 'eco',
      orchestrator: 'did:orch',
      rolesAndObligations: [],
      status: 'pending',
      serviceOfferings: [],
      purpose: [],
      members: [],
      revokedMembers: [],
      serviceChains: [],
      useDVCT: false,
      createdAt: '2026-07-04T22:00:00.000Z',
      updatedAt: '2026-07-04T22:00:00.000Z',
      __v: 0,
    } as ContractResponseType;

    expect(contract.vlaId).to.equal(undefined);
  });

  it('should parse a bilateral contract WITH vlaId', () => {
    const contract = {
      _id: 'bil456',
      dataProvider: 'did:provider',
      dataConsumer: 'did:consumer',
      serviceOffering: 'so-1',
      purpose: [],
      negotiators: [],
      status: 'pending',
      policy: [],
      signatures: [],
      revokedSignatures: [],
      useDVCT: false,
      vlaId: '570b22e0-2e90-4e02-8c7b-1d6d274629f3',
      createdAt: '2026-07-04T22:00:00.000Z',
      updatedAt: '2026-07-04T22:00:00.000Z',
      __v: 0,
    } as BilateralResponseType;

    expect(contract.vlaId).to.equal('570b22e0-2e90-4e02-8c7b-1d6d274629f3');
  });

  it('should parse a bilateral contract WITHOUT vlaId (optional)', () => {
    const contract = {
      _id: 'bil457',
      dataProvider: 'did:provider',
      dataConsumer: 'did:consumer',
      serviceOffering: 'so-1',
      purpose: [],
      negotiators: [],
      status: 'pending',
      policy: [],
      signatures: [],
      revokedSignatures: [],
      useDVCT: false,
      createdAt: '2026-07-04T22:00:00.000Z',
      updatedAt: '2026-07-04T22:00:00.000Z',
      __v: 0,
    } as BilateralResponseType;

    expect(contract.vlaId).to.equal(undefined);
  });
});