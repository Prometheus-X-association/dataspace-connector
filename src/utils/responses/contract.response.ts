type Policy = {
    description: string;
    permission: {
        action: string;
        target: string;
        constraint: any[];
    }[];
    prohibition: any[];
};

type ServiceOffering = {
    participant: string;
    serviceOffering: string;
    policies: Policy[];
    _id: string;
};

type Member = {
    participant: string;
    role: string;
    signature: string;
    date: string;
};

export type ContractResponseType = {
    _id: string;
    ecosystem: string;
    orchestrator: string;
    rolesAndObligations: any[];
    status: string;
    serviceOfferings: ServiceOffering[];
    purpose: any[];
    members: Member[];
    revokedMembers: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
};
