import { Logger } from '../../../libs/loggers';
import {
    IInfrastructureConfiguration,
    InfrastructureConfiguration,
} from '../../../utils/types/infrastructureConfiguration';
import { PipelineMeta } from 'dpcp-library';
import { handle } from '../../../libs/loaders/handler';
import {
    getRepresentation,
    postOrPutRepresentation,
} from '../../../libs/loaders/representationFetcher';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { DataExchange } from '../../../utils/types/dataExchange';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { validateConsent } from '../../../libs/third-party/validateConsent';
import { IDecryptedConsent } from '../../../utils/types/decryptConsent';

export const nodeCallbackService = async (props: {
    targetId: string;
    data: any;
    meta: PipelineMeta;
}) => {
    try {
        const { targetId, data, meta } = props;
        let augmentedData: any;
        let latestData: any;
        let confs: any[];
        let conf: any;
        let decryptedConsent: IDecryptedConsent;

        // @ts-ignore
        if (meta.configuration.signedConsent && meta.configuration.encrypted) {
            // @ts-ignore
            const { signedConsent, encrypted } = meta.configuration;

            decryptedConsent = await decryptSignedConsent(
                signedConsent,
                encrypted
            );

            // Send validation verification to VisionsTrust to receive user info and DataTypes
            const validation = await validateConsent(signedConsent, encrypted);

            const { verified } = validation;

            if (!verified) {
                throw new Error('consent not verified.');
            }
        }

        const dataExchange = await DataExchange.findOne({
            // @ts-ignore
            providerDataExchange: meta?.configuration?.dataExchange,
        });

        if (!dataExchange) {
            throw new Error('data exchange not found.');
        }

        if (
            //@ts-ignore
            meta?.configuration?.infrastructureConfiguration &&
            //@ts-ignore
            meta?.configuration?.infrastructureConfiguration.includes(',')
        ) {
            confs = await InfrastructureConfiguration.find({
                _id: {
                    //@ts-ignore
                    $in: meta?.configuration?.infrastructureConfiguration.split(
                        ','
                    ),
                },
            });
        } else {
            conf = await InfrastructureConfiguration.findById(
                //@ts-ignore
                meta?.configuration?.infrastructureConfiguration
            );
        }

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
                        })
                    );

                    augmentedData = data;
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
                        data: selectData(usedConf, data),
                        contract: dataExchange.contract,
                        //@ts-ignore
                        params: meta?.configuration?.params,
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
                            ? (decryptedConsent as any).consumerUserIdentifier
                                  .identifier
                            : undefined,
                        dataExchange,
                    });

                    if (response && softwareResourceSD.isAPI)
                        latestData = response?.data ?? response;
                }
            }
        }

        await dataExchange.completeDataProcessing(targetId);
        return {
            augmentedData,
            latestData,
        };
    } catch (e) {
        Logger.error({
            message: e.message,
            location: 'nodeCallbackService',
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
