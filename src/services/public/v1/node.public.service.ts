import { Logger } from '../../../libs/loggers';
import {
    ChainStatus,
    NodeSignal,
    NodeSupervisor,
    PipelineMeta,
} from 'dpcp-library';
import { handle } from '../../../libs/loaders/handler';
import {
    getRepresentation,
    postOrPutRepresentation,
} from '../../../libs/loaders/representationFetcher';
import {
    getCatalogData,
    getParticipant,
} from '../../../libs/third-party/catalog';
import { DataExchange } from '../../../utils/types/dataExchange';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { validateConsent } from '../../../libs/third-party/validateConsent';
import { IDecryptedConsent } from '../../../utils/types/decryptConsent';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { getContract } from '../../../libs/third-party/contract';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import { pepVerification } from '../../../utils/pepVerification';
import { verifyInfrastructureInContract } from '../../../utils/verifyInfrastructureInContract';
import { isJsonString } from '../../../utils/isJsonString';
import { getConfigFile } from '../../../libs/loaders/configuration';
import { ServiceChainAdapterService } from './servicechainadapter.public.service';

type CallbackMeta = PipelineMeta & {
    configuration: {
        dataExchange: string;
        signedConsent: string;
        encrypted: string;
        params: unknown;
    };
};

export const nodeCallbackService = async (props: {
    targetId: string;
    data: any;
    meta: PipelineMeta;
    nextTargetId?: string;
    previousTargetId?: string;
    chainId?: string;
    nextNodeResolver?: string;
}) => {
    const {
        targetId,
        data,
        meta,
        nextTargetId,
        chainId,
        previousTargetId,
        nextNodeResolver,
    } = props;
    let output: any;
    let decryptedConsent: IDecryptedConsent;

    const dataExchange = await DataExchange.findOne({
        providerDataExchange: (meta as CallbackMeta).configuration.dataExchange,
    });

    if (!dataExchange) {
        throw new Error('data exchange not found.');
    }

    try {
        // Get the contract
        const [contractResp] = await handle(getContract(dataExchange.contract));

        let pep = false;

        if (targetId.includes('serviceofferings')) {
            const serviceOffering = selfDescriptionProcessor(
                targetId,
                dataExchange,
                dataExchange.contract,
                contractResp
            );

            //PEP
            const { success: pepVerif } = await pepVerification({
                targetResource: serviceOffering,
                referenceURL: dataExchange.contract,
            });

            pep = pepVerif;
        } else if (targetId.includes('infrastructureservices')) {
            pep = verifyInfrastructureInContract({
                service: targetId,
                contract: contractResp,
                chainId: dataExchange?.serviceChain?.catalogId,
            });
        }

        if (pep) {
            Logger.info({
                message:
                    'PEP is validated, processing of sending data to the remote service.',
                location: 'nodeCallbackService',
            });
            if (
                (meta as CallbackMeta).configuration.signedConsent &&
                (meta as CallbackMeta).configuration.encrypted
            ) {
                const { signedConsent, encrypted } = (meta as CallbackMeta)
                    .configuration;

                decryptedConsent = await decryptSignedConsent(
                    signedConsent,
                    encrypted
                );

                // Send validation verification to VisionsTrust to receive user info and DataTypes
                const validation = await validateConsent(
                    signedConsent,
                    encrypted
                );

                const { verified } = validation;

                if (!verified) {
                    throw new Error('consent not verified.');
                }
            }

            //retrieve offer by targetId
            const [offer] = await handle(getCatalogData(targetId));

            // data Resources = augmented data // no use of the raw data
            if (offer.dataResources && offer.dataResources.length > 0) {
                for (const dataResource of offer.dataResources) {
                    //look in data exchange if params exists for this resource in serviceChainParams array
                    const resource = dataExchange.serviceChainParams.filter(
                        (element) => element?.resource === dataResource
                    );

                    //retrieve targetId = offer
                    const [dataResourceSD] = await handle(
                        getCatalogData(dataResource)
                    );
                    if (
                        dataResourceSD.representation &&
                        dataResourceSD.representation.url
                    ) {
                        const payload = {
                            resource,
                            method: dataResourceSD.representation?.method,
                            endpoint: dataResourceSD.representation.url,
                            credential:
                                dataResourceSD.representation?.credential,
                            representationQueryParams:
                                dataResourceSD?.representation?.queryParams,
                            dataExchange,
                            chainId,
                            nextTargetId,
                            previousTargetId,
                            targetId,
                        };

                        if (getConfigFile().serviceChainAdapter) {
                            output = await new ServiceChainAdapterService(
                                payload
                            ).processGetRepresentationFlow();
                        } else {
                            const [data] = await handle(
                                getRepresentation(payload)
                            );

                            output = data;
                        }
                    }
                }
            }

            // softwareResource = default POST data, use conf if exists and check for is API
            if (offer.softwareResources && offer.softwareResources.length > 0) {
                for (const softwareResource of offer.softwareResources) {
                    //look in data exchange if params exists for this resource in serviceChainParams array
                    const resource = dataExchange.serviceChainParams.filter(
                        (element) => element?.resource === softwareResource
                    );

                    //retrieve targetId = offer
                    const [softwareResourceSD] = await handle(
                        getCatalogData(softwareResource)
                    );

                    if (
                        softwareResourceSD.representation &&
                        softwareResourceSD.representation.url
                    ) {
                        const params = (meta as CallbackMeta)?.configuration
                            ?.params;

                        const jsonString = Object.values(params).join('');

                        const dataPayload = {
                            data: data.data ?? data,
                            contract: dataExchange.contract,
                            params: isJsonString(jsonString)
                                ? JSON.parse(jsonString)
                                : jsonString,
                            ...(data.previousNodeParams
                                ? {
                                      previousNodeParams:
                                          data.previousNodeParams,
                                  }
                                : {}),
                        };

                        let response = null;

                        const payload = {
                            resource: resource[0]?.resource,
                            representationUrl:
                                softwareResourceSD.representation.url,
                            representationQueryParams:
                                softwareResourceSD.representation?.queryParams,
                            data: dataPayload,
                            credential:
                                softwareResourceSD.representation?.credential,
                            method: softwareResourceSD.representation?.method,
                            decryptedConsent: decryptedConsent ?? undefined,
                            user: decryptedConsent
                                ? (decryptedConsent as any)
                                      .consumerUserIdentifier.identifier
                                : undefined,
                            dataExchange,
                            chainId,
                            nextTargetId,
                            previousTargetId,
                            nextNodeResolver,
                            targetId,
                        };

                        if (getConfigFile().serviceChainAdapter) {
                            response = await new ServiceChainAdapterService(
                                payload
                            ).processPotsOrPutRepresentationFlow();
                        } else {
                            response = await postOrPutRepresentation(payload);
                        }

                        if (response && softwareResourceSD.isAPI)
                            output = response?.data ?? response;
                    }
                }
            }

            await dataExchange.completeServiceChain(targetId);
            return {
                ...output,
            };
        }
    } catch (e) {
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.NODE_CALLBACK_ERROR,
            e.message
        );
        Logger.error({
            message: e.message,
            location: 'nodeCallbackService',
        });
    }
};

export const nodePreCallbackService = async (props: {
    targetId?: string;
    data?: any;
    meta: PipelineMeta;
    chainId?: string;
    nextTargetId?: string;
    previousTargetId?: string;
    nextNodeResolver?: string;
}) => {
    const {
        targetId,
        data,
        meta,
        chainId,
        nextTargetId,
        previousTargetId,
        nextNodeResolver,
    } = props;

    const dataExchange = await DataExchange.findOne({
        providerDataExchange: (meta as CallbackMeta).configuration.dataExchange,
    });

    if (!dataExchange) {
        throw new Error('data exchange not found.');
    }

    try {
        // Get the contract
        const [contractResp] = await handle(getContract(dataExchange.contract));

        let pep = false;

        if (targetId.includes('serviceofferings')) {
            const serviceOffering = selfDescriptionProcessor(
                targetId,
                dataExchange,
                dataExchange.contract,
                contractResp
            );

            //PEP
            const { success: pepVerif } = await pepVerification({
                targetResource: serviceOffering,
                referenceURL: dataExchange.contract,
            });

            pep = pepVerif;
        } else if (targetId.includes('infrastructureservices')) {
            pep = verifyInfrastructureInContract({
                service: targetId,
                contract: contractResp,
                chainId: dataExchange?.serviceChain?.catalogId,
            });
        }

        if (pep) {
            //retrieve offer by targetId
            const [offer] = await handle(getCatalogData(targetId));
            // data Resources = augmented data // no use of the raw data
            if (offer.dataResources && offer.dataResources.length > 0) {
                for (const dataResource of offer.dataResources) {
                    //retrieve targetId = offer
                    const [dataResourceSD] = await handle(
                        getCatalogData(dataResource)
                    );
                    if (
                        dataResourceSD.representation &&
                        dataResourceSD.representation.url
                    ) {
                        const [data] = await handle(
                            getRepresentation({
                                method: dataResourceSD.representation?.method,
                                endpoint: dataResourceSD.representation.url,
                                credential:
                                    dataResourceSD.representation?.credential,
                                chainId,
                                nextTargetId,
                                previousTargetId,
                                nextNodeResolver,
                            })
                        );

                        const participant = await getParticipant();

                        return {
                            participant: {
                                name: participant.legalName,
                                connectorUrl: participant.dataspaceEndpoint,
                                id: participant._id,
                            },
                            ...data,
                        };
                    }
                }
            }

            // // softwareResource = default POST data, use conf if exists and check for is API
            // if (offer.softwareResources && offer.softwareResources.length > 0) {
            //     for (const softwareResource of offer.softwareResources) {
            //         // choose wich conf to use
            //         const usedConf =
            //             confs?.find(
            //                 (element) => element.resource === softwareResource
            //             ) || conf;
            //
            //         //retrieve targetId = offer
            //         const [softwareResourceSD] = await handle(
            //             getCatalogData(softwareResource)
            //         );
            //
            //         if (
            //             softwareResourceSD.representation &&
            //             softwareResourceSD.representation.url
            //         ) {
            //             const dataPayload = {
            //                 data: selectData(usedConf, data),
            //                 contract: dataExchange.contract,
            //                 //@ts-ignore
            //                 params: meta?.configuration?.params,
            //             };
            //
            //             // Only add consent if it has a value
            //             // if (data?.consent) {
            //             //     dataPayload.consent = data.consent;
            //             // }
            //
            //             const response = await postOrPutRepresentation({
            //                 representationUrl:
            //                 softwareResourceSD.representation.url,
            //                 verb: conf?.verb,
            //                 data: dataPayload,
            //                 credential:
            //                 softwareResourceSD.representation?.credential,
            //                 method: softwareResourceSD.representation?.method,
            //                 decryptedConsent: decryptedConsent ?? undefined,
            //                 user: decryptedConsent
            //                     ? (decryptedConsent as any).consumerUserIdentifier
            //                         .identifier
            //                     : undefined,
            //                 dataExchange,
            //             });
            //
            //             if (response && softwareResourceSD.isAPI)
            //                 latestData = response?.data ?? response;
            //         }
            //     }
            // }
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: 'nodePreCallbackService',
        });
    }
};

export const nodeResumeService = async (props: {
    hostURI?: string;
    targetId: string;
    data?: any;
    params?: any;
    chainId: string;
}): Promise<{ success: boolean }> => {
    const { chainId, data, params, targetId, hostURI } = props;

    try {
        const nodeSupervisor = NodeSupervisor.retrieveService();

        if (!hostURI || hostURI === 'local') {
            const nodes = nodeSupervisor.getNodesByServiceAndChain(
                targetId,
                chainId
            );
            const nodeId = nodes[0]?.getId();
            await nodeSupervisor.enqueueSignals(
                nodeId,
                [NodeSignal.NODE_RESUME],
                { data, params }
            );
        } else if (hostURI && hostURI !== 'local') {
            nodeSupervisor.remoteReport(
                {
                    status: ChainStatus.CHAIN_NOTIFIED,
                    signal: NodeSignal.NODE_SUSPEND,
                    payload: { targetId, hostURI },
                },
                chainId
            );
        } else {
            return { success: false };
        }

        return { success: true };
    } catch (e) {
        Logger.error({
            message: e.message,
            location: 'nodeResumeService',
        });
    }
};
