import { DataExchange, IDataExchange } from '../../../utils/types/dataExchange';
import { handle } from '../../../libs/loaders/handler';
import { getContract } from '../../../libs/third-party/contract';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { consumerError } from '../../../utils/consumerError';
import { Regexes } from '../../../utils/regexes';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { consumerImport } from '../../../libs/third-party/consumer';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import { Logger } from '../../../libs/loggers';
import { triggerInfrastructureFlowService } from './infrastructure.public.service';
import { checksum } from '../../../functions/checksum.function';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { getCredentialByIdService } from '../../private/v1/credential.private.service';
import postgres from 'postgres';

interface IProviderExportServiceOptions {
    infrastructureConfigurationId?: string;
}

/**
 * Provider Export Service
 * @param consumerDataExchange
 * @param dataPayload
 * @constructor
 */
export const ProviderExportService = async (
    consumerDataExchange: string,
    dataPayload?: any
) => {
    let serviceOffering: string;
    let contract: string;
    let resource: string;
    let endpointData: any;
    let data: any;

    //Get the data exchange
    const dataExchange = await DataExchange.findOne({
        consumerDataExchange: consumerDataExchange,
    });

    try {
        // Get the contract
        const [contractResp] = await handle(getContract(dataExchange.contract));

        if(!dataPayload){
            const useServiceChain = dataExchange?.serviceChain &&
                dataExchange?.serviceChain.services.length > 0

            serviceOffering = selfDescriptionProcessor(
                dataExchange.resources[0].serviceOffering,
                dataExchange,
                dataExchange.contract,
                contractResp
            );

            //PEP
            const {
                success: pep,
                contractID,
                resourceID,
            } = await pepVerification({
                targetResource: serviceOffering,
                referenceURL: dataExchange.contract,
            });

            contract = contractID;
            resource = resourceID;

            if (pep) {
                for (const resource of dataExchange.resources) {
                    const resourceSD = resource.resource;

                    // B to B exchange
                    if (
                        dataExchange._id &&
                        dataExchange.consumerEndpoint &&
                        resourceSD
                    ) {
                        //Call the catalog endpoint
                        const [endpoint] = await handle(
                            getCatalogData(resourceSD)
                        );

                        endpointData = endpoint;

                        if (!endpointData?.representation) {
                            await consumerError(
                                dataExchange.consumerEndpoint,
                                dataExchange._id.toString(),
                                'No representation found'
                            );
                        }

                        let contentLength = 0;
                        if (
                            !endpointData?.representation?.url.match(
                                Regexes.urlParams
                            )
                        ) {
                            switch (endpointData?.representation?.type.toUpperCase()) {
                                case 'REST': {
                                    const [getProviderData, responseHeaders] =
                                        await handle(
                                            getRepresentation({
                                                resource: resourceSD,
                                                method: endpointData?.representation
                                                    ?.method,
                                                endpoint:
                                                endpointData?.representation
                                                    ?.url,
                                                credential:
                                                endpointData?.representation
                                                    ?.credential,
                                                representationQueryParams:
                                                endpointData?.representation
                                                    ?.queryParams,
                                                proxy: endpointData?.representation
                                                    ?.proxy,
                                                dataExchange,
                                                mimeType:
                                                endpointData?.representation
                                                    ?.mimeType,
                                            })
                                        );

                                    data = getProviderData;

                                    if (!useServiceChain){
                                        contentLength =
                                            responseHeaders['content-length'];

                                    if (!responseHeaders['content-file-name']) {
                                        const parsedUrl = new URL(
                                            endpointData?.representation?.url
                                        );
                                        const [, bucketFromUrl, ...keyParts] =
                                            parsedUrl.pathname.split('/');
                                        responseHeaders['content-file-name'] =
                                            keyParts.join('/');
                                    }

                                    if (
                                        !endpointData?.representation?.mimeType
                                    ) {
                                        Logger.info({
                                            message: `No mimetype defined for ${resourceSD} in catalog, defaulting to application/json`,
                                            location: 'ProviderExportService',
                                        });
                                    }

                                        if (
                                            endpointData?.representation?.mimeType &&
                                            !responseHeaders['content-type']?.includes(
                                                endpointData?.representation?.mimeType
                                            )
                                        ) {
                                            throw new Error(
                                                `Mimetype validation failed for ${resourceSD}, expected: ${endpointData?.representation?.mimeType}, got: ${responseHeaders['content-type']} from representation url`
                                            );
                                        }

                                        if (
                                            !endpointData?.representation?.mimeType?.includes(
                                                'application/json'
                                            )
                                        ) {
                                            await dataExchange.updateProviderData({
                                                mimeType:
                                                endpointData?.representation
                                                    ?.mimeType,
                                                checksum: checksum(data),
                                                size: responseHeaders['content-length'],
                                                fileName:
                                                    responseHeaders[
                                                        'content-file-name'
                                                        ],
                                            });
                                        }
                                    }

                                    break;
                                }

                                case 'POSTGRESQL': {
                                    let cred;

                                    const sqlConfig =
                                        endpointData?.representation?.sql;

                                if (!sqlConfig.query) {
                                    const message = `No SQL query defined for ${resourceSD} in catalog`;
                                    Logger.error({
                                        message,
                                        location: 'ProviderExportService',
                                    });
                                    throw new Error(message);
                                }

                                if (!sqlConfig?.url) {
                                    const message = `No URL defined for ${resourceSD} in catalog`;
                                    Logger.error({
                                        message,
                                        location: 'ProviderExportService',
                                    });
                                    throw new Error(message);
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

                                        data = await sql.unsafe(sqlConfig?.query);
                                        contentLength = data.length;

                                        await sql.end();
                                    } catch (e) {
                                        Logger.error({
                                            message: `Error executing SQL for ${resourceSD}: ${e.message}`,
                                            location: 'ProviderExportService',
                                        });
                                        await dataExchange?.updateStatus(
                                            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
                                            e.message,
                                            await getEndpoint()
                                        );

                                        throw e;
                                    }

                                    break;
                                }
                            }
                        }
                    }
                }
            } else {
                await dataExchange?.updateStatus(
                    DataExchangeStatusEnum.PEP_ERROR,
                    "The policies can't be verified",
                    await getEndpoint()
                );
            }
        } else {
            data = dataPayload
        }

        if (
            dataExchange?.serviceChain &&
            dataExchange?.serviceChain.services.length > 0
        ) {

            //Trigger the infrastructure flow
            await triggerInfrastructureFlowService({
                serviceChain: dataExchange.serviceChain,
                dataExchange,
                data,
                dataPayload: !!dataPayload
            });
        } else {
            //Trigger the generic flow
            await triggerGenericFlow({
                dataExchange,
                data,
                serviceOffering,
                contractID: contract,
                resourceID: resource,
                endpointData,
            });
        }
        return true;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        await dataExchange?.updateStatus(
            DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR,
            e.message,
            await getEndpoint()
        );
    }
};

/**
 * Trigger the generic flow to send data to consumer endpoint
 * @param props
 */
const triggerGenericFlow = async (props: {
    dataExchange: IDataExchange;
    data: any;
    serviceOffering: string;
    contractID: string;
    resourceID: string;
    endpointData?: any;
}) => {
    try {
        //Send the data to generic endpoint
        const [consumerImportRes] = await handle(
            consumerImport(
                props.dataExchange.consumerEndpoint,
                props.dataExchange._id.toString(),
                props.data,
                props.endpointData?.apiResponseRepresentation,
                props.dataExchange.providerData.mimetype
            )
        );

        if (consumerImportRes && !props.dataExchange.data) {
            const names = await pepLeftOperandsVerification({
                targetResource: props.serviceOffering,
            });
            await processLeftOperands(
                names,
                props.contractID,
                props.resourceID
            );
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};
