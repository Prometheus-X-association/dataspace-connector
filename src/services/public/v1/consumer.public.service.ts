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
import {getEndpoint, getVersion, getProxy} from '../../../libs/loaders/configuration';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { ExchangeError } from '../../../libs/errors/exchangeError';
import { getContract } from '../../../libs/third-party/contract';
import { ObjectId } from 'mongodb';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { providerImport } from '../../../libs/third-party/provider';
import { getCredentialByIdService } from '../../private/v1/credential.private.service';
import postgres from 'postgres';
import { checkConnectorProxy } from '../../../libs/third-party/proxy';
import {urlChecker} from "../../../utils/urlChecker";

export const triggerBilateralFlow = async (props: {
    contract: string;
    resources: string[] | IData[];
    purposes: string[] | IData[];
    providerParams?: IParams;
    serviceChainId?: string;
    consumerParams?: IParams;
    serviceChainParams?: IParams;
    dataProcessingId?: string;
    directResponseVisualizationId?: string;
    data?: any
}) => {
    const {
        resources,
        purposes,
        providerParams,
        consumerParams,
        serviceChainId,
        serviceChainParams,
        directResponseVisualizationId,
        data,
    } = props;

    const contract = props.contract;
    let providerEndpoint: string;
    let mappedDataResources: any;

    // retrieve contract
    const [contractResponse] = await handle(getContract(contract));
    // get Provider endpoint

    if(!data){
        const [providerResponse] = await handle(
            axios.get(
                contractResponse.dataProvider,
                await checkConnectorProxy({
                    configProxy: getProxy(),
                })
            )
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

        providerEndpoint = providerResponse?.dataspaceEndpoint;

        const [resourceResponse] = await handle(
            axios.get(
                contractResponse.serviceOffering,
                await checkConnectorProxy({
                    configProxy: getProxy(),
                })
            )
        );

        mappedDataResources = resourcesMapper({
            resources,
            resourceResponse,
            serviceOffering: contractResponse.serviceOffering,
            type: 'dataResources',
        });
    }

    const [purposeResponse] = await handle(
        axios.get(
            contractResponse.purpose[0].purpose,
            await checkConnectorProxy({
                configProxy: getProxy(),
            })
        )
    );

    const mappedSoftwareResources = resourcesMapper({
        resources: purposes,
        resourceResponse: purposeResponse,
        serviceOffering: contractResponse.purpose[0].purpose,
        type: 'softwareResources',
    });

    // Verify PII
    await verifyPII(mappedDataResources, contractResponse.purpose[0].purpose);

    let dataExchange: IDataExchange;

    if (providerEndpoint !== (await getEndpoint())) {
        dataExchange = await DataExchange.create({
            providerEndpoint: providerEndpoint,
            resources: mappedDataResources,
            purposes: mappedSoftwareResources,
            purposeId: contractResponse.purpose[0].purpose,
            contract: props.contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            consumerParams: consumerParams ?? [],
            createdAt: new Date(),
            directResponseVisualizationId: directResponseVisualizationId ?? undefined,
            callbackUrl: directResponseVisualizationId ? `${urlChecker(await getEndpoint(), `callbacks/direct-response-visualization/${directResponseVisualizationId}`)}` : undefined
        });
        // Create the data exchange at the provider
        await dataExchange.createDataExchangeToOtherParticipant('provider');
    } else {
        const [consumerResponse] = await handle(
            axios.get(
                contractResponse.dataConsumer,
                await checkConnectorProxy({
                    configProxy: getProxy(),
                })
            )
        );
        dataExchange = await DataExchange.create({
            consumerEndpoint: consumerResponse?.dataspaceEndpoint,
            resources: mappedDataResources,
            purposes: mappedSoftwareResources,
            purposeId: contractResponse.purpose[0].purpose,
            contract: props.contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            consumerParams: consumerParams ?? [],
            createdAt: new Date(),
            directResponseVisualizationId: directResponseVisualizationId ?? undefined,
            callbackUrl: directResponseVisualizationId ? `${urlChecker(await getEndpoint(), `callbacks/direct-response-visualization/${directResponseVisualizationId}`)}` : undefined
        });
        // Create the data exchange at the provider
        await dataExchange.createDataExchangeToOtherParticipant('consumer');
    }

    return {
        dataExchange,
        providerEndpoint: providerEndpoint,
    };
};

export const triggerEcosystemFlow = async (props: {
    resourceId: string;
    purposeId: string;
    contract: string;
    resources: string[] | IData[];
    purposes: string[] | IData[];
    providerParams?: IParams;
    serviceChainId?: string;
    consumerParams?: IParams;
    serviceChainParams?: IParams;
    directResponseVisualizationId?: string;
    data?: any;
}) => {
    const {
        contract,
        resources,
        providerParams,
        serviceChainId,
        purposes,
        consumerParams,
        serviceChainParams,
        directResponseVisualizationId,
        data,
    } = props;

    let { resourceId, purposeId } = props;

    //Create a data Exchange
    let dataExchange: IDataExchange;
    let serviceChain: IServiceChain;
    let providerEndpoint: string;
    let providerProxy: any;
    let mappedDataResources: any;

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

    if(!data){
        const resourceExists = contractResponse.serviceOfferings.find(
            (so: { serviceOffering: string }) => so.serviceOffering === resourceId
        );

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

        mappedDataResources = resourcesMapper({
            resources,
            resourceResponse: serviceOfferingResponse,
            serviceOffering: resourceId,
            type: 'dataResources',
        });

        // Verify PII
        await verifyPII(mappedDataResources, purposeId);

        //search Provider Endpoint
        const providerSelfDescription = contractResponse.serviceOfferings.find(
            (serviceOffering: any) => {
                if (serviceOffering.serviceOffering === resourceId) {
                    return serviceOffering;
                } else return null;
            }
        );

        const [providerSelfDescriptionResponse] = await handle(
            axios.get(
                providerSelfDescription.participant,
                await checkConnectorProxy({
                    configProxy: getProxy(),
                })
            )
        );

        providerEndpoint= providerSelfDescriptionResponse?.dataspaceEndpoint;
        providerProxy= providerSelfDescriptionResponse?.dataspaceConnectorProxy;

    } else {
        providerEndpoint = (await getEndpoint());
    }

    const [purposeResponse] = await handle(getCatalogData(purposeId));

    const mappedSoftwareResources = resourcesMapper({
        resources: purposes,
        resourceResponse: purposeResponse,
        serviceOffering: purposeId,
        type: 'softwareResources',
    });

    const consumerSelfDescription = contractResponse.serviceOfferings.find(
        (serviceOffering: any) => {
            if (serviceOffering.serviceOffering === purposeId) {
                return serviceOffering;
            } else return null;
        }
    );

    const [consumerSelfDescriptionResponse] = await handle(
        axios.get(
            consumerSelfDescription.participant,
            await checkConnectorProxy({
                configProxy: getProxy(),
            })
        )
    );

    //case participant is provider and consumer
    //add all field to allow chain usage
    if (
        consumerSelfDescriptionResponse?.dataspaceEndpoint ===
            (await getEndpoint()) &&
        providerEndpoint ===
            (await getEndpoint())
    ) {
        const id = new ObjectId();
        dataExchange = await DataExchange.create({
            _id: id,
            consumerDataExchange: id,
            providerDataExchange: id,
            consumerEndpoint:
                consumerSelfDescriptionResponse?.dataspaceEndpoint,
            providerEndpoint:
            providerEndpoint,
            consumerPdcVersion: await getVersion(),
            providerPdcVersion: await getVersion(),
            providerProxy:
                providerProxy ??
                null,
            consumerProxy:
                consumerSelfDescriptionResponse?.dataspaceConnectorProxy ??
                null,
            resources: mappedDataResources,
            purposes: mappedSoftwareResources,
            purposeId: purposeId,
            contract: contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            consumerParams: consumerParams ?? [],
            serviceChainParams: serviceChainParams ?? [],
            createdAt: new Date(),
            serviceChain: serviceChain ?? [],
            directResponseVisualizationId: directResponseVisualizationId ?? undefined,
            callbackUrl: directResponseVisualizationId ? `${urlChecker(await getEndpoint(), `callbacks/direct-response-visualization/${directResponseVisualizationId}`)}` : undefined,
            data: !!data
        });
    } else if (
        consumerSelfDescriptionResponse?.dataspaceEndpoint ===
        (await getEndpoint())
    ) {
        //search consumerEndpoint
        dataExchange = await DataExchange.create({
            providerEndpoint:
            providerEndpoint,
            providerProxy:
                providerProxy ??
                null,
            consumerProxy:
                consumerSelfDescriptionResponse?.dataspaceConnectorProxy ??
                null,
            resources: mappedDataResources,
            purposes: mappedSoftwareResources,
            purposeId: purposeId,
            contract: contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            consumerParams: consumerParams ?? [],
            serviceChainParams: serviceChainParams ?? [],
            createdAt: new Date(),
            serviceChain: serviceChain ?? [],
            directResponseVisualizationId: directResponseVisualizationId ?? undefined,
            callbackUrl: directResponseVisualizationId ? `${urlChecker(await getEndpoint(), `callbacks/direct-response-visualization/${directResponseVisualizationId}`)}` : undefined,
            data: !!data
        });
        await dataExchange.createDataExchangeToOtherParticipant('provider');
    } else if (
        providerEndpoint ===
        (await getEndpoint())
    ) {
        dataExchange = await DataExchange.create({
            consumerEndpoint:
                consumerSelfDescriptionResponse?.dataspaceEndpoint,
            providerProxy:
                providerProxy ??
                null,
            consumerProxy:
                consumerSelfDescriptionResponse?.dataspaceConnectorProxy ??
                null,
            resources: mappedDataResources,
            purposes: mappedSoftwareResources,
            purposeId: purposeId,
            contract: contract,
            status: 'PENDING',
            providerParams: providerParams ?? [],
            consumerParams: consumerParams ?? [],
            serviceChainParams: serviceChainParams ?? [],
            createdAt: new Date(),
            serviceChain: serviceChain ?? [],
            directResponseVisualizationId: directResponseVisualizationId ?? undefined,
            callbackUrl: directResponseVisualizationId ? `${urlChecker(await getEndpoint(), `callbacks/direct-response-visualization/${directResponseVisualizationId}`)}` : undefined,
            data: !!data
        });

        // Create the data exchange at the provider
        await dataExchange.createDataExchangeToOtherParticipant('consumer');
    }

    return {
        dataExchange,
        providerEndpoint: providerEndpoint,
    };
};

const resourcesMapper = (props: {
    resources: string[] | IData[];
    resourceResponse: any;
    serviceOffering: string;
    type: 'dataResources' | 'softwareResources';
}) => {
    const { resources, resourceResponse, serviceOffering, type } = props;

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
        mappedResources = resourceResponse[type].map((dt: string | IData) => {
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
        });
    } else {
        mappedResources = resources?.map((dt: string | IData) => {
            if (typeof dt === 'string') {
                const resourceExists = resourceResponse[type].find(
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
                const resourceExists = resourceResponse[type].find(
                    (so: string) => so === dt.resource
                );
                if (resourceExists) {
                    return {
                        serviceOffering: serviceOffering,
                        skipBodyProcessing: dt?.skipBodyProcessing,
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

export const consumerImportService = async (props: {
    providerDataExchange: string;
    data: any;
    apiResponseRepresentation: any;
}) => {
    const { providerDataExchange, data, apiResponseRepresentation } = props;

    // Fix: If data is an array of numbers (serialized Buffer), convert it back to Buffer
    let processedData = data;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'number') {
        processedData = Buffer.from(data);
    }

    //Get dataExchange
    const dataExchange = await DataExchange.findOne({
        providerDataExchange: providerDataExchange,
    });

    for (const purpose of dataExchange.purposes) {
        const [catalogSoftwareResource] = await handle(
            getCatalogData(purpose.resource)
        );

        //Import data to endpoint of softwareResource
        const endpoint = catalogSoftwareResource?.representation?.url;

        let consumerResponse;

        switch (catalogSoftwareResource?.representation?.type.toUpperCase()) {
            case 'REST': {
                //Import data to endpoint of softwareResource
                const endpoint = catalogSoftwareResource?.representation?.url;

                if (!endpoint) {
                    await dataExchange?.updateStatus(
                        DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR
                    );
                    break;
                }

                    const [postConsumerData] = await handle(
                        postRepresentation({
                            resource: purpose.resource,
                            method: catalogSoftwareResource?.representation
                                ?.method,
                            endpoint,
                            data: processedData,
                            credential:
                                catalogSoftwareResource?.representation
                                    ?.credential,
                            dataExchange,
                            representationQueryParams:
                                catalogSoftwareResource.representation
                                    ?.queryParams,
                            proxy: catalogSoftwareResource?.representation
                                ?.proxy,
                        })
                    );

                    consumerResponse = postConsumerData;

                await dataExchange.updateStatus(
                    DataExchangeStatusEnum.IMPORT_SUCCESS
                );

                break;
            }
            case 'POSTGRESQL': {
                let cred;

                const sqlConfig = catalogSoftwareResource?.representation?.sql;

                if (!sqlConfig?.url) {
                    Logger.error({
                        message: `No URL defined for ${purpose?.resource} in catalog`,
                        location: 'consumerImportService',
                    });
                    break;
                }

                if (sqlConfig?.credential) {
                    cred = await getCredentialByIdService(
                        sqlConfig?.credential
                    );
                }

                try {
                    const sql = postgres(sqlConfig?.url, {
                        host: sqlConfig?.host,
                        port: sqlConfig?.port,
                        database: sqlConfig?.database,
                        username: cred?.key,
                        password: cred?.value,
                    });

                    consumerResponse = await sql.unsafe(
                        !sqlConfig?.query ? processedData : sqlConfig?.query
                    );

                    await sql.end();
                } catch (e) {
                    Logger.error({
                        message: `Error executing SQL for ${purpose.resource}: ${e.message}`,
                        location: 'consumerImportService',
                    });
                    await dataExchange?.updateStatus(
                        DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                        e.message,
                        await getEndpoint()
                    );

                    throw e;
                }

                await dataExchange.updateStatus(
                    DataExchangeStatusEnum.IMPORT_SUCCESS
                );

                break;
            }
            default:
                {
                    await dataExchange.updateStatus(
                        DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR,
                        'Representation type not supported'
                    );
                }

                break;
        }

        if (catalogSoftwareResource.isAPI) {
            if (apiResponseRepresentation) {
                await handle(
                    providerImport(
                        dataExchange.providerEndpoint,
                        consumerResponse,
                        dataExchange._id.toString()
                    )
                );
            }
        }

        if(dataExchange.directResponseVisualizationId && dataExchange.callbackUrl) {
            axios.post(dataExchange.callbackUrl, consumerResponse)
        }

        await dataExchange?.updateStatus(DataExchangeStatusEnum.IMPORT_SUCCESS);
    }
};
