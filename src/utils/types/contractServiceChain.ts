export type Service = {
    participant: string;
    service: string;
    configuration: string;
    params: {
        [key: string]: string;
    };
    completed?: boolean;
    pre?: any[];
};

export type ContractServiceChain = {
    catalogId: string;
    services: Service[];
};
