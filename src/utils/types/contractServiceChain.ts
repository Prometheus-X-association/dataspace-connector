export type Service = {
    participant: string;
    service: string;
    configuration: string;
    params: {
        [key: string]: string;
    };
    completed?: boolean;
    pre?: any[];
    participantAuthorizedAt?: Date;
    transferCompletedAt?: Date;
};

export type ContractServiceChain = {
    catalogId: string;
    services: Service[];
};
