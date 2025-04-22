import {
    DataExchange,
    DataExchangeResult,
} from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { handle } from '../../../libs/loaders/handler';
import axios from 'axios';
import { Logger } from '../../../libs/loggers';
import {
    getRepresentation,
    postOrPutRepresentation,
} from '../../../libs/loaders/representationFetcher';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import { triggerInfrastructureFlowService } from './infrastructure.public.service';
import { IDecryptedConsent } from '../../../utils/types/decryptConsent';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { validateConsent } from '../../../libs/third-party/validateConsent';

export interface ImportDataParams {
    data: any;
    user: any;
    signedConsent: string;
    encrypted: string;
    apiResponseRepresentation: any;
    isPayload: boolean;
    resource: any;
}

export const importDataService = async ({
    data,
    user,
    signedConsent,
    encrypted,
    apiResponseRepresentation,
    isPayload,
    resource,
}: ImportDataParams): Promise<DataExchangeResult> => {
    try {
        const decryptedConsent = await decryptSignedConsent(
            signedConsent,
            encrypted
        );
        const dataExchange = await DataExchange.findOne({
            providerDataExchange: decryptedConsent.providerDataExchangeId,
        });
        try {
            let pepResult: any = { success: true };

            if (decryptedConsent.contract.includes('contracts')) {
                pepResult = await pepVerification({
                    targetResource:
                        decryptedConsent.purposes[0].serviceOffering,
                    referenceURL: decryptedConsent.contract,
                });
            }

            if (pepResult.success) {
                if (isPayload) {
                    const [dataResourceSD] = await handle(
                        getCatalogData(resource)
                    );

                    await postOrPutRepresentation({
                        decryptedConsent,
                        method: dataResourceSD?.apiResponseRepresentation
                            ?.method,
                        representationUrl:
                            dataResourceSD?.apiResponseRepresentation.url,
                        data,
                        credential:
                            dataResourceSD?.apiResponseRepresentation
                                ?.credential,
                        user,
                        dataExchange,
                    });
                } else {
                    const [softwareResourceSD] = await handle(
                        getCatalogData(decryptedConsent.purposes[0].resource)
                    );

                    const payload = await postOrPutRepresentation({
                        decryptedConsent,
                        method: softwareResourceSD.representation?.method,
                        representationUrl:
                            softwareResourceSD.representation.url,
                        data,
                        credential:
                            softwareResourceSD.representation?.credential,
                        user,
                        dataExchange,
                    });

                    if (softwareResourceSD.isAPI && apiResponseRepresentation) {
                        await axios({
                            url: (decryptedConsent as any).dataProvider
                                .endpoints.dataImport,
                            method: 'POST',
                            data: {
                                data: payload,
                                user: (decryptedConsent as any)
                                    .providerUserIdentifier.identifier,
                                signedConsent: signedConsent,
                                encrypted,
                                resource,
                                isPayload: true,
                            },
                        });
                    }
                }
                return {
                    exchange: await dataExchange.updateStatus(
                        DataExchangeStatusEnum.IMPORT_SUCCESS
                    ),
                };
            } else {
                return {
                    exchange: await dataExchange.updateStatus(
                        DataExchangeStatusEnum.PEP_ERROR,
                        "The policies can't be verified"
                    ),
                    errorMessage: 'PEP Error',
                };
            }
        } catch (e) {
            Logger.error({
                message: e.message,
                location: e.stack,
            });
            return {
                exchange: await dataExchange.updateStatus(
                    DataExchangeStatusEnum.CONSENT_IMPORT_ERROR,
                    e.message
                ),
                errorMessage: e.message,
            };
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
        return { exchange: null, errorMessage: e.message };
    }
};

export const exportDataService = async ({
    signedConsent,
    encrypted,
}: {
    signedConsent: string;
    encrypted: string;
}): Promise<DataExchangeResult> => {
    try {
        // Decrypt signed consent and retrieve token + consentId
        const decryptedConsent = await decryptSignedConsent(
            signedConsent,
            encrypted
        );

        // Get dataExchange
        const dataExchange = await DataExchange.findById(
            decryptedConsent.providerDataExchangeId
        );
        try {
            // Send validation verification to VisionsTrust to receive user info and DataTypes
            const validation = await validateConsent(signedConsent, encrypted);
            const { verified } = validation;

            if (!verified) {
                throw new Error('consent not verified.');
            }

            for (const dt of decryptedConsent.data) {
                const { success: pepSuccess } = await pepVerification({
                    targetResource: dt.serviceOffering,
                    referenceURL: decryptedConsent.contract,
                });

                if (pepSuccess) {
                    const [dataResourceSD] = await handle(
                        getCatalogData(dt.resource)
                    );

                    const [data] = await handle(
                        getRepresentation({
                            method: dataResourceSD.representation?.method,
                            endpoint: dataResourceSD.representation.url,
                            credential:
                                dataResourceSD.representation?.credential,
                            decryptedConsent,
                            dataExchange,
                        })
                    );

                    //When the data is retrieved, check wich flow to trigger based infrastructure options
                    // the options and the serviceChains will be represented in the consent
                    if (
                        dataExchange.serviceChain &&
                        dataExchange.serviceChain.services.length > 0
                    ) {
                        //Trigger the infrastructure flow
                        await triggerInfrastructureFlowService(
                            dataExchange.serviceChain,
                            dataExchange,
                            data,
                            signedConsent,
                            encrypted
                        );
                    } else {
                        //Trigger the generic flow
                        await triggerGenericFlow({
                            decryptedConsent,
                            data,
                            signedConsent,
                            encrypted,
                            dataResourceSD,
                            dt,
                        });
                    }

                    return {
                        exchange: dataExchange,
                    };
                } else {
                    return {
                        exchange: await dataExchange.updateStatus(
                            DataExchangeStatusEnum.PEP_ERROR,
                            "The policies can't be verified"
                        ),
                        errorMessage: 'PEP Error',
                    };
                }
            }
        } catch (e) {
            Logger.error({
                message: e.message,
                location: e.stack,
            });
            return {
                exchange: await dataExchange.updateStatus(
                    DataExchangeStatusEnum.CONSENT_EXPORT_ERROR,
                    e.message
                ),
                errorMessage: e.message,
            };
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
        return { exchange: null, errorMessage: e.message };
    }
};

const triggerGenericFlow = async (props: {
    decryptedConsent: IDecryptedConsent;
    data: any;
    signedConsent: string;
    encrypted: string;
    dataResourceSD: any;
    dt: { serviceOffering: string; resource: string };
}) => {
    const {
        decryptedConsent,
        data,
        signedConsent,
        encrypted,
        dataResourceSD,
        dt,
    } = props;
    try {
        // POST the data to the import service
        const importResponse = await axios({
            url: (decryptedConsent as any).dataConsumer.endpoints.dataImport,
            method: 'POST',
            data: {
                data: data,
                user: (decryptedConsent as any).consumerUserIdentifier
                    .identifier,
                signedConsent: signedConsent,
                encrypted,
                resource: dt.resource,
                apiResponseRepresentation: !!(
                    dataResourceSD.isPayloadForAPI &&
                    dataResourceSD.apiResponseRepresentation
                ),
            },
        });

        // Process left Operands incrementation
        if (importResponse?.data?.message === 'OK') {
            const names = await pepLeftOperandsVerification({
                targetResource: dt.serviceOffering,
            });
            await processLeftOperands(
                names,
                decryptedConsent.contract,
                dt.serviceOffering
            );
        }

        return true;
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};
