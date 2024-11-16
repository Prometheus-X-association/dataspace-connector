export type InfrastructureService = {
    participant: string;
    serviceOffering: string;
    configuration: string;
    params: {
        [key: string]: string;
    };
};

export type ContractDataProcessing = {
    dataProviderService: string;
    dataConsumerService: string;
    infrastructureServices: InfrastructureService[];
};
