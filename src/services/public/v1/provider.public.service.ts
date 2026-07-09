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
import {
    getEndpoint,
    getDvaUri,
    getDvaApiKey,
} from '../../../libs/loaders/configuration';
import { getCredentialByIdService } from '../../private/v1/credential.private.service';
import postgres from 'postgres';
import { requestAttestation } from '../../../libs/third-party/dva';

interface IProviderExportServiceOptions {
    infrastructureConfigurationId?: string;
}

/**
 * Provider Export Service
 * @param consumerDataExchange
 * @param options
 * @constructor
 */
export const ProviderExportService = async (
    consumerDataExchange: string,
    options?: IProviderExportServiceOptions
) => {
    //Get the data exchange
    const dataExchange = await DataExchange.findOne({
        consumerDataExchange: consumerDataExchange,
    });

    try {
        // Get the contract
        const [contractResp] = await handle(getContract(dataExchange.contract));

        const useServiceChain = dataExchange?.serviceChain &&
            dataExchange?.serviceChain.services.length > 0

        const serviceOffering = selfDescriptionProcessor(
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
                    const [endpointData] = await handle(
                        getCatalogData(resourceSD)
                    );

                    if (!endpointData?.representation) {
                        await consumerError(
                            dataExchange.consumerEndpoint,
                            dataExchange._id.toString(),
                            'No representation found'
                        );
                    }

                    let data;
                    let contentLength = 0;
                    if (
                        !endpointData?.representation?.url.match(
                            Regexes.urlParams
                        )
                    ) {
                        switch (endpointData?.representation?.type) {
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

                                    if (!endpointData?.representation?.mimeType) {
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
                                    Logger.error({
                                        message: `No SQL query defined for ${resourceSD} in catalog`,
                                        location: 'ProviderExportService',
                                    });
                                    break;
                                }

                                if (!sqlConfig?.url) {
                                    Logger.error({
                                        message: `No URL defined for ${resourceSD} in catalog`,
                                        location: 'ProviderExportService',
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

                    if (
                        dataExchange?.serviceChain &&
                        dataExchange?.serviceChain.services.length > 0
                    ) {

                        if (endpointData?.representation?.mimeType &&
                            !endpointData?.representation?.mimeType?.includes('application/json') &&
                            !endpointData?.representation?.mimeType?.includes('text/plain')) {
                            throw new Error(
                                `Mimetype validation failed for service chain, only 'application/json' or 'text/plain' supported, got: ${endpointData?.representation?.mimeType} for ${resourceSD}`
                            );
                        }

                        // Veracity attestation hook (placed after data fetch and before push)
                        const vlaId = (contractResp as any)?.vlaId ?? null;
                        const dvaUri = await getDvaUri();
                        // Capture the JWS token so the infrastructure flow can forward it.
                        let aovJwsChain: string | undefined;
                        let aovAttesterDidChain: string | undefined;
                        if (vlaId && dvaUri) {
                            try {
                                const aov = await requestAttestation({
                                    dvaUri,
                                    vlaId,
                                    exchangeId: dataExchange._id.toString(),
                                    contract: contractResp as any,
                                    data,
                                    attesterDid: (await getEndpoint()) ?? '',
                                    apiKey: (await getDvaApiKey()) || undefined,
                                });
                                if (!aov.evaluationPassing) {
                                    await dataExchange.updateStatus(
                                        DataExchangeStatusEnum.VERACITY_ERROR,
                                        {
                                            reason: 'veracity evaluation failed',
                                            aov,
                                        }
                                    );
                                    continue;
                                }
                                // Capture issuer key and JWS so the exchange record
                                // carries them for any downstream verification step.
                                aovJwsChain = aov.jws ?? undefined;
                                aovAttesterDidChain = aov.issuerDidKey;
                            } catch (e) {
                                await dataExchange.updateStatus(
                                    DataExchangeStatusEnum.VERACITY_ERROR,
                                    {
                                        reason: 'DVA request failed: ' + e.message,
                                    }
                                );
                                continue;
                            }
                        }

                        // If an AoV token was obtained, record it on the exchange record
                        // so infrastructure nodes and the consumer can retrieve and verify it.
                        // updateProviderData only accepts checksum/mimeType/size, so we use
                        // updateStatus with an informational payload instead.
                        if (aovJwsChain || aovAttesterDidChain) {
                            await dataExchange.updateStatus(
                                DataExchangeStatusEnum.VERACITY_ATTESTED,
                                {
                                    aovJws: aovJwsChain,
                                    aovAttesterDid: aovAttesterDidChain,
                                }
                            );
                        }

                        //Trigger the infrastructure flow
                        await triggerInfrastructureFlowService(
                            dataExchange.serviceChain,
                            dataExchange,
                            data
                        );
                    } else {
                        // Veracity attestation hook (placed after data fetch and before push)
                        const vlaId = (contractResp as any)?.vlaId ?? null;
                        const dvaUri = await getDvaUri();
                        let aovJws: string | undefined;
                        let aovAttesterDid: string | undefined;
                        if (vlaId && dvaUri) {
                            try {
                                const aov = await requestAttestation({
                                    dvaUri,
                                    vlaId,
                                    exchangeId: dataExchange._id.toString(),
                                    contract: contractResp as any,
                                    data,
                                    attesterDid: (await getEndpoint()) ?? '',
                                    apiKey: (await getDvaApiKey()) || undefined,
                                });
                                if (!aov.evaluationPassing) {
                                    await dataExchange.updateStatus(
                                        DataExchangeStatusEnum.VERACITY_ERROR,
                                        {
                                            reason: 'veracity evaluation failed',
                                            aov,
                                        }
                                    );
                                    continue;
                                }
                                aovJws = aov.jws ?? undefined;
                                aovAttesterDid = aov.issuerDidKey;
                            } catch (e) {
                                await dataExchange.updateStatus(
                                    DataExchangeStatusEnum.VERACITY_ERROR,
                                    {
                                        reason: 'DVA request failed: ' + e.message,
                                    }
                                );
                                continue;
                            }
                        }

                        //Trigger the generic flow
                        await triggerGenericFlow({
                            dataExchange,
                            data,
                            serviceOffering,
                            contractID,
                            resourceID,
                            endpointData,
                            aovJws,
                            aovAttesterDid,
                        });
                    }
                    Logger.info({
                        message: `Successfully retrieve data from ${resourceSD} with size of ${contentLength}Bytes`,
                        location: 'ProviderExportService',
                    });
                }
            }

            return true;
        } else {
            await dataExchange?.updateStatus(
                DataExchangeStatusEnum.PEP_ERROR,
                "The policies can't be verified",
                await getEndpoint()
            );
        }
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
    aovJws?: string;
    aovAttesterDid?: string;
}) => {
    try {
        //Send the data to generic endpoint
        const [consumerImportRes] = await handle(
            consumerImport(
                props.dataExchange.consumerEndpoint,
                props.dataExchange._id.toString(),
                props.data,
                props.endpointData?.apiResponseRepresentation,
                props.dataExchange.providerData.mimetype,
                props.aovJws,
                props.aovAttesterDid
            )
        );

        if (consumerImportRes) {
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
