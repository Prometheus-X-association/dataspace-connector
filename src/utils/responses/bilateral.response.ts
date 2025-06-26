type Purpose = {
    purpose: string;
    piiCategory: any[];
    _id: string;
};

type Negotiator = {
    did: string;
    _id: string;
};

type Policy = {
    description: string;
    permission: any[];
    prohibition: any[];
};

type Signature = {
    did: string;
    party: string;
    value: string;
    date: string;
};

export type BilateralResponseType = {
    _id: string;
    dataProvider: string;
    dataConsumer: string;
    serviceOffering: string;
    purpose: Purpose[];
    negotiators: Negotiator[];
    status: string;
    policy: Policy[];
    signatures: Signature[];
    revokedSignatures: any[];
    useDVCT: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
};
