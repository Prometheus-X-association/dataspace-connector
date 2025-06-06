import { Logger } from '../../../libs/loggers';
import { IInfrastructureConfiguration } from '../../../utils/types/infrastructureConfiguration';
import { PipelineMeta } from 'dpcp-library';
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
import {
    getContract,
    getContractData,
} from '../../../libs/third-party/contract';
import { selfDescriptionProcessor } from '../../../utils/selfDescriptionProcessor';
import { pepVerification } from '../../../utils/pepVerification';
import { verifyInfrastructureInContract } from '../../../utils/verifyInfrastructureInContract';
import { sendDVCT } from './dvct.public.service';

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
    let confs: any[];
    let conf: any;
    let decryptedConsent: IDecryptedConsent;

    const dataExchange = await DataExchange.findOne({
        providerDataExchange: (meta as CallbackMeta).configuration.dataExchange,
    });
    dataExchange.DVCTPassed = false;

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
                chainId: chainId.split(':')[1].split('-')[0],
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

            // if (
            //     //@ts-ignore
            //     meta?.configuration?.infrastructureConfiguration &&
            //     //@ts-ignore
            //     meta?.configuration?.infrastructureConfiguration.includes(',')
            // ) {
            //     confs = await InfrastructureConfiguration.find({
            //         _id: {
            //             //@ts-ignore
            //             $in: meta?.configuration?.infrastructureConfiguration.split(
            //                 ','
            //             ),
            //         },
            //     });
            // } else {
            //     conf = await InfrastructureConfiguration.findById(
            //         //@ts-ignore
            //         meta?.configuration?.infrastructureConfiguration
            //     );
            // }

            //retrieve offer by targetId
            const [offer] = await handle(getCatalogData(targetId));

            // data Resources = augmented data // no use of the raw data
            if (offer.dataResources && offer.dataResources.length > 0) {
                for (const dataResource of offer.dataResources) {
                    //choose wich conf use
                    // const usedConf =
                    //     confs?.find(
                    //         (element) => element.resource === dataResource
                    //     ) || conf;

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
                                dataExchange,
                                chainId,
                                nextTargetId,
                                previousTargetId,
                                targetId,
                            })
                        );

                        output = data;
                    }
                }
            }

            // softwareResource = default POST data, use conf if exists and check for is API
            if (offer.softwareResources && offer.softwareResources.length > 0) {
                for (const softwareResource of offer.softwareResources) {
                    // choose wich conf to use
                    const usedConf =
                        confs?.find(
                            (element) => element.resource === softwareResource
                        ) || conf;

                    //retrieve targetId = offer
                    const [softwareResourceSD] = await handle(
                        getCatalogData(softwareResource)
                    );

                    if (
                        softwareResourceSD.representation &&
                        softwareResourceSD.representation.url
                    ) {
                        const dataPayload = {
                            data: data.data ?? data,
                            contract: dataExchange.contract,
                            params: (meta as CallbackMeta)?.configuration
                                ?.params,
                            ...(data.previousNodeParams
                                ? {
                                      previousNodeParams:
                                          data.previousNodeParams,
                                  }
                                : {}),
                        };

                        // Only add consent if it has a value
                        // if (data?.consent) {
                        //     dataPayload.consent = data.consent;
                        // }

                        const response = await postOrPutRepresentation({
                            representationUrl:
                                softwareResourceSD.representation.url,
                            verb: conf?.verb,
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
                        });

                        if (response && softwareResourceSD.isAPI)
                            output = response?.data ?? response;
                    }
                }
            }

            // Contract retriving to check if it uses DVCT
            const contract = await getContractData(dataExchange.contract);
            if (!contract || contract instanceof Error) {
                throw new Error('Contract not found');
            }
            const currentParticipant = await getParticipant();

            // Check if the contract uses DVCT and send DVCT payload if it does
            if (contract.useDVCT) {
                try {
                    await sendDVCT(
                        currentParticipant._id,
                        previousTargetId,
                        contract._id,
                        dataExchange.providerEndpoint,
                        dataExchange.consumerEndpoint,
                        dataExchange.serviceChain.services[0].participant,
                        dataExchange.serviceChain
                    );
                } catch (error) {
                    throw new Error(error.message);
                }
            }
            await dataExchange.save();

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
                chainId: chainId.split(':')[1].split('-')[0],
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

const selectData = (conf: IInfrastructureConfiguration, data: any) => {
    if (!data.latestData && !data.transformedData) {
        return data;
    }

    if (!conf) return data.latestData;

    switch (conf.data) {
        case 'latestData': {
            return data.latestData;
        }
        case 'augmentedData': {
            return data.augmentedData;
        }
        case 'latestData:augmentedData': {
            return { ...data.latestData, ...data.transformedData };
        }
    }
};
