export type InfrastructureService = {
    participant: string;
    serviceOffering: string;
    configuration: string;
    params: {
        [key: string]: string;
    };
};

export type ContractDataProcessing = {
    _id: string;
    infrastructureServices: InfrastructureService[];
};
