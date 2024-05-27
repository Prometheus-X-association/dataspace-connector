import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange } from '../../../utils/types/dataExchange';
import { postRepresentation } from '../../../libs/loaders/representationFetcher';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/services/contract';
import {providerExport, providerImport} from '../../../libs/services/provider';
import { getCatalogData } from '../../../libs/services/catalog';
import { Logger } from '../../../libs/loggers';
import { pepVerification } from '../../../utils/pepVerification';
import {DataExchangeStatusEnum} from "../../../utils/enums/dataExchangeStatusEnum";
import {selfDescriptionProcessor} from "../../../utils/selfDescriptionProcessor";
import axios from "axios";
import {getEndpoint} from "../../../libs/loaders/configuration";

/**
 * trigger the data exchange between provider and consumer in a bilateral or ecosystem contract
 * @param req
 * @param res
 * @param next
 */
export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        let { providerEndpoint, resources } = req.body;
        const { contract, resourceId, purposeId } = req.body;

        // retrieve contract
        const [contractResponse] = await handle(
            getContract(contract)
        );


        //Create a data Exchange
        let dataExchange;

        // ecosystem contract
        if (contract.includes('contracts')) {
            if(providerEndpoint === await getEndpoint()){
                Logger.error({
                    message: 'Can\'t trigger data exchange on the provider side.',
                    location: 'consumerExchange',
                });
                return restfulResponse(res, 500, { success: false, message: 'Can\'t trigger data exchange on the provider side.'});
            }

            // verify providerEndpoint, resource and purpose exists
            if(!providerEndpoint && !resourceId && !purposeId ){
                Logger.error({
                    message: 'Missing body params',
                    location: 'consumerExchange',
                });
                return restfulResponse(res, 500, { success: false, message: 'Missing body params'});
            }

            //check if resource and purpose exists inside contract
            const resourceExists = contractResponse.serviceOfferings.find((so: {serviceOffering: string}) => so.serviceOffering === resourceId);
            const purposeExists = contractResponse.serviceOfferings.find((so: {serviceOffering: string}) => so.serviceOffering === purposeId);

            if(!purposeExists){
                Logger.error({
                    message: 'Wrong purpose given',
                    location: 'consumerExchange',
                });
                return restfulResponse(res, 500, { success: false, message: 'Wrong purpose given'});
            }
            if(!resourceExists){
                Logger.error({
                    message: 'Wrong resource given',
                    location: 'consumerExchange',
                });
                return restfulResponse(res, 500, { success: false, message: 'Wrong resource given'});
            }

            const [serviceOfferingResponse] = await handle(
                getCatalogData(resourceId)
            )

            if(!resources || resources?.length === 0){
                resources = serviceOfferingResponse.dataResources.map((dt: any) => {
                    return {
                        serviceOffering: resourceId,
                        resource: dt,
                    }
                })
            } else {
                resources = resources?.map((dt: any) => {
                    const resourceExists = serviceOfferingResponse.dataResources.find((so: string) => so === dt);
                    if(resourceExists){
                        return {
                            serviceOffering: resourceId,
                            resource: dt,
                        }
                    } else {
                        throw new Error('resource doesn\'t exists in the service offering')
                    }
                })
            }

            dataExchange = await DataExchange.create({
                providerEndpoint: providerEndpoint,
                resource: resources,
                purposeId: purposeId,
                contract: contract,
                status: 'PENDING',
                createdAt: new Date(),
            });
        } else {
            // bilateral Contract
            // get Provider endpoint
            const [providerResponse] = await handle(
                axios.get(contractResponse.dataProvider)
            );

            const [resourceResponse] = await handle(
                axios.get(contractResponse.serviceOffering)
            );

            if(!providerResponse?.dataspaceEndpoint) {
                Logger.error({
                    message: 'Provider missing PDC endpoint',
                    location: 'consumerExchange',
                });
                restfulResponse(res, 500, { success: false, message: 'Provider missing PDC endpoint' });
            }

            providerEndpoint = providerResponse?.dataspaceEndpoint;

            if(!resources || resources?.length === 0){
                resources = resourceResponse.dataResources.map((dt: any) => {
                    return {
                        serviceOffering: contractResponse.serviceOffering,
                        resource: dt,
                    }
                })
            } else {
                resources = resources?.map((dt: any) => {
                    const resourceExists = resourceResponse.dataResources.find((so: string) => so === dt);
                    if(resourceExists){
                        return {
                            serviceOffering: contractResponse.serviceOffering,
                            resource: dt,
                        }
                    } else {
                        throw new Error('resource doesn\'t exists in the service offering')
                    }
                })
            }

            dataExchange = await DataExchange.create({
                providerEndpoint: providerResponse?.dataspaceEndpoint,
                resource: resources,
                purposeId: contractResponse.purpose[0].purpose,
                contract: contract,
                status: 'PENDING',
                createdAt: new Date(),
            });
        }

        // Create the data exchange at the provider
        // @ts-ignore
        await dataExchange.createDataExchangeToOtherParticipant('provider')

        // return code 200 everything is ok
        restfulResponse(res, 200, { success: true });

        //Trigger provider.ts endpoint exchange
        await handle(
            providerExport(providerEndpoint, dataExchange._id.toString())
        );

    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        restfulResponse(res, 500, { success: false, message: e.message});
    }
};

/**
 * import the data from the provider into the consumer software representation
 * @param req
 * @param res
 * @param next
 */
export const consumerImport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //req.body
    const { providerDataExchange, data, apiResponseRepresentation } = req.body;

    //Get dataExchangeId
    const dataExchange = await DataExchange.findOne({
        providerDataExchange: providerDataExchange
    });

    try {

        //retrieve endpoint
        // const [contractResp] = await handle(
        //     getContract(dataExchange.contract)
        // );

        // const serviceOffering = selfDescriptionProcessor(dataExchange.resource[0].serviceOffering, dataExchange, dataExchange.contract, contractResp)

        //PEP
        // const {pep} = await pepVerification({
        //     targetResource: dataExchange.purposeId,
        //     referenceURL: dataExchange.contract,
        // });
        //
        // if (pep) {
            const [catalogServiceOffering, catalogServiceOfferingError] = await handle(
                getCatalogData(dataExchange.purposeId)
            );

            const [catalogSoftwareResource, catalogSoftwareResourceError] =
                await handle(
                    getCatalogData(catalogServiceOffering?.softwareResources[0])
                );

            //Import data to endpoint of softwareResource
            const endpoint = catalogSoftwareResource?.representation?.url;

            if (!endpoint) {
                // @ts-ignore
                await dataExchange.updateStatus(DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR)
            } else {
                switch (catalogSoftwareResource?.representation?.type) {
                    case 'REST':
                        // eslint-disable-next-line no-case-declarations
                        const [postConsumerData, postConsumerDataError] = await handle(
                            postRepresentation(
                                catalogSoftwareResource?.representation?.method,
                                endpoint,
                                data,
                                catalogSoftwareResource?.representation?.credential
                            )
                        );

                        if(catalogSoftwareResource.isAPI){
                            if(apiResponseRepresentation){
                                const [providerImportData, providerImportDataError] = await handle(
                                    providerImport(
                                        dataExchange.providerEndpoint,
                                        postConsumerData,
                                        dataExchange._id.toString()
                                    )
                                );
                            }
                            // @ts-ignore
                            await dataExchange.updateStatus(DataExchangeStatusEnum.IMPORT_SUCCESS)
                            return restfulResponse(res, 200, postConsumerData);
                        }

                        break;
                }
                // @ts-ignore
                await dataExchange.updateStatus(DataExchangeStatusEnum.IMPORT_SUCCESS)
            }
            return restfulResponse(res, 200, { success: true });
        // } else {
        //     // @ts-ignore
        //     await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR)
        //     return restfulResponse(res, 500, { success: false });
        // }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        // @ts-ignore
        await dataExchange.updateStatus(DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR, e.message)

        return restfulResponse(res, 500, { success: false });
    }
};
