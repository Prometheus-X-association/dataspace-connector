import axios from 'axios';
import { Logger } from '../../../libs/loggers';
import { handle } from '../../../libs/loaders/handler';
import {
    DataExchange,
    IData,
    IDataExchange,
    IServiceChain,
    IParams,
} from '../../../utils/types/dataExchange';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { ExchangeError } from '../../../libs/errors/exchangeError';
import { getContract } from '../../../libs/third-party/contract';

export const triggerBilateralFlow = async (props: {
    contract: string;
    resources: string[] | IData[];
    providerParams?: IParams;
    serviceChainId?: string;
}) => {
    const { resources, providerParams, serviceChainId } = props;

    const contract = props.contract;

    // retrieve contract
    const [contractResponse] = await handle(getContract(contract));
    // get Provider endpoint
    const [providerResponse] = await handle(
        axios.get(contractResponse.dataProvider)
    );

    const [resourceResponse] = await handle(
        axios.get(contractResponse.serviceOffering)
    );

    if (!providerResponse?.dataspaceEndpoint) {
        Logger.error({
            message: 'Provider missing PDC endpoint',
            location: 'consumerExchange',
        });
        throw new ExchangeError(
            'Provider missing PDC endpoint',
            'triggerBilateralFlow',
            500
        );
    }

    const mappedResources = resourcesMapper({
        resources,
        resourceResponse,
        serviceOffering: contractResponse.serviceOffering,
    });

    // Verify PII
    await verifyPII(mappedResources, contractResponse.purpose[0].purpose);

    let dataExchange: IDataExchange;

    if (providerResponse?.dataspaceEndpoint !== (await getEndpoint())) {
        dataExchange = await DataExchange.create({
            providerEndpoint: providerResponse?.dataspaceEndpoint,
            resources: mappedResources,
            purposeId: contractResponse.purpose[0].purpose,
            contract: props.contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            createdAt: new Date(),
        });
        // Create the data exchange at the provider
        await dataExchange.createDataExchangeToOtherParticipant('provider');
    } else {
        const [consumerResponse] = await handle(
            axios.get(contractResponse.dataConsumer)
        );
        dataExchange = await DataExchange.create({
            consumerEndpoint: consumerResponse?.dataspaceEndpoint,
            resources: mappedResources,
            purposeId: contractResponse.purpose[0].purpose,
            contract: props.contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            createdAt: new Date(),
        });
        // Create the data exchange at the provider
        await dataExchange.createDataExchangeToOtherParticipant('consumer');
    }

    return {
        dataExchange,
        providerEndpoint: providerResponse?.dataspaceEndpoint,
    };
};

export const triggerEcosystemFlow = async (props: {
    resourceId: string;
    purposeId: string;
    contract: string;
    resources: string[] | IData[];
    providerParams?: IParams;
    serviceChainId?: string;
}) => {
    const { contract, resources, providerParams, serviceChainId } = props;
    let { resourceId, purposeId } = props;
    //Create a data Exchange
    let dataExchange: IDataExchange;
    let serviceChain: IServiceChain;

    // retrieve contract
    const [contractResponse] = await handle(getContract(contract));

    if (serviceChainId) {
        const { resource, purpose, dp } = verifyDataProcessingInContract(
            serviceChainId,
            contractResponse.serviceChains
        );
        resourceId = resource;
        purposeId = purpose;
        serviceChain = dp;
    }

    // verify providerEndpoint, resource and purpose exists
    if (!resourceId && !purposeId) {
        Logger.error({
            message: 'Missing body params',
            location: 'consumerExchange',
        });
        throw new ExchangeError(
            'Missing body params',
            'triggerEcosystemFlow',
            500
        );
    }

    //check if resource and purpose exists inside contract
    const resourceExists = contractResponse.serviceOfferings.find(
        (so: { serviceOffering: string }) => so.serviceOffering === resourceId
    );
    const purposeExists = contractResponse.serviceOfferings.find(
        (so: { serviceOffering: string }) => so.serviceOffering === purposeId
    );

    if (!purposeExists) {
        Logger.error({
            message: 'Wrong purpose given',
            location: 'consumerExchange',
        });
        throw new ExchangeError(
            'Wrong purpose given',
            'triggerEcosystemFlow',
            500
        );
    }
    if (!resourceExists) {
        Logger.error({
            message: 'Wrong resource given',
            location: 'consumerExchange',
        });
        throw new ExchangeError(
            'Wrong resource given',
            'triggerEcosystemFlow',
            500
        );
    }

    const [serviceOfferingResponse] = await handle(getCatalogData(resourceId));

    const mappedResources = resourcesMapper({
        resources,
        resourceResponse: serviceOfferingResponse,
        serviceOffering: resourceId,
    });

    const consumerSelfDescription = contractResponse.serviceOfferings.find(
        (serviceOffering: any) => {
            if (serviceOffering.serviceOffering === purposeId) {
                return serviceOffering;
            } else return null;
        }
    );

    const [consumerSelfDescriptionResponse] = await handle(
        axios.get(consumerSelfDescription.participant)
    );

    //search Provider Endpoint
    const providerSelfDescription = contractResponse.serviceOfferings.find(
        (serviceOffering: any) => {
            if (serviceOffering.serviceOffering === resourceId) {
                return serviceOffering;
            } else return null;
        }
    );

    const [providerSelfDescriptionResponse] = await handle(
        axios.get(providerSelfDescription.participant)
    );

    await verifyPII(mappedResources, purposeId);

    if (
        consumerSelfDescriptionResponse?.dataspaceEndpoint ===
        (await getEndpoint())
    ) {
        //search consumerEndpoint
        dataExchange = await DataExchange.create({
            providerEndpoint:
                providerSelfDescriptionResponse?.dataspaceEndpoint,
            resources: mappedResources,
            purposeId: purposeId,
            contract: contract,
            status: 'PENDING',
            providerParams: providerParams,
            createdAt: new Date(),
            serviceChain: serviceChain ?? [],
        });
        await dataExchange.createDataExchangeToOtherParticipant('provider');
    } else if (
        providerSelfDescriptionResponse?.dataspaceEndpoint ===
        (await getEndpoint())
    ) {
        dataExchange = await DataExchange.create({
            consumerEndpoint:
                consumerSelfDescriptionResponse?.dataspaceEndpoint,
            resources: mappedResources,
            purposeId: purposeId,
            contract: contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            createdAt: new Date(),
            serviceChain: serviceChain ?? [],
        });

        // Create the data exchange at the provider
        await dataExchange.createDataExchangeToOtherParticipant('consumer');
    }

    return {
        dataExchange,
        providerEndpoint: providerSelfDescriptionResponse?.dataspaceEndpoint,
    };
};

const resourcesMapper = (props: {
    resources: string[] | IData[];
    resourceResponse: any;
    serviceOffering: string;
}) => {
    const { resources, resourceResponse, serviceOffering } = props;

    let mappedResources:
        | (
              | { serviceOffering: any; resource: string }
              | {
                    serviceOffering: any;
                    resource: string;
                    params: [IParams];
                }
          )[]
        | undefined;

    if (!resources || resources?.length === 0) {
        mappedResources = resourceResponse.dataResources.map(
            (dt: string | IData) => {
                if (typeof dt === 'string') {
                    return {
                        serviceOffering: serviceOffering,
                        resource: dt,
                    };
                } else {
                    return {
                        serviceOffering: serviceOffering,
                        resource: dt.resource,
                        params: dt.params,
                    };
                }
            }
        );
    } else {
        mappedResources = resources?.map((dt: string | IData) => {
            if (typeof dt === 'string') {
                const resourceExists = resourceResponse.dataResources.find(
                    (so: string) => so === dt
                );
                if (resourceExists) {
                    return {
                        serviceOffering: serviceOffering,
                        resource: dt,
                    };
                } else {
                    throw new Error(
                        "resource doesn't exists in the service offering"
                    );
                }
            } else {
                const resourceExists = resourceResponse.dataResources.find(
                    (so: string) => so === dt.resource
                );
                if (resourceExists) {
                    return {
                        serviceOffering: serviceOffering,
                        resource: dt.resource,
                        params: dt.params,
                    };
                } else {
                    throw new Error(
                        "resource doesn't exists in the service offering"
                    );
                }
            }
        });
    }

    return mappedResources;
};

const verifyDataProcessingInContract = (
    id: string,
    serviceChains: IServiceChain[]
) => {
    if (serviceChains.length === 0) {
        throw new Error('Data processing is empty in the contract.');
    }

    const serviceChain = serviceChains?.find(
        (element) => element.catalogId === id
    );

    if (!serviceChain) {
        throw new Error('Data processing not found in the contract.');
    }

    return {
        resource: serviceChain.services[0].service,
        purpose:
            serviceChain.services[serviceChain.services.length - 1].service,
        dp: serviceChain,
    };
};

const verifyPII = async (
    mappedResources: { resource: string }[],
    purpose: string
) => {
    let PII = false;

    for (const mappedResource of mappedResources) {
        const [response] = await handle(
            getCatalogData(mappedResource.resource)
        );
        if (response.containsPII && response.containsPII === true) PII = true;
    }

    const [purposeResponse] = await handle(getCatalogData(purpose));

    if (
        purposeResponse.softwareResources &&
        purposeResponse.softwareResources.length > 0
    ) {
        for (const softwareResource of purposeResponse.softwareResources) {
            const [response] = await handle(getCatalogData(softwareResource));
            if (response.usePII && response.usePII === true) PII = true;
        }
    } else if (purposeResponse.usePII && purposeResponse.usePII === true) {
        PII = true;
    }

    if (PII) {
        throw new Error('A resource use PII.');
    }
};
