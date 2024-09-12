import {
    DataExchange,
    DataExchangeResult,
} from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { getCatalogData } from '../../../libs/services/catalog';
import { handle } from '../../../libs/loaders/handler';
import axios from 'axios';
import { Logger } from '../../../libs/loggers';
import {
    getRepresentation,
    postRepresentation,
    putRepresentation,
} from '../../../libs/loaders/representationFetcher';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Regexes } from '../../../utils/regexes';
import { User } from '../../../utils/types/user';
import { validateConsent } from '../../../libs/services/validateConsent';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';

export interface ImportDataParams {
    data: any;
    user: any;
    signedConsent: string;
    encrypted: string;
    apiResponseRepresentation: any;
    isPayload: boolean;
    resource: any;
}

/**
 * Post or Put data to given representation
 * @param params
 * @return Promise<any>
 */
const postOrPutRepresentation = async (params: {
    decryptedConsent?: any;
    representationUrl: string;
    data: any;
    method: string;
    credential: string;
    user: any;
}) => {
    // if contains params in URL is PUT Method
    if (params.representationUrl.match(Regexes.userIdParams)) {
        if (params.data._id) delete params.data._id;

        // replace params between {} by id in consent
        const url = params.representationUrl.replace(
            Regexes.userIdParams,
            () => {
                return params.user;
            }
        );

        const [updateData] = await handle(
            putRepresentation(
                params.method,
                url,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return updateData;
    } else if (params.representationUrl.match(Regexes.urlParams)) {
        const user = await User.findOne({ internalID: params.user }).lean();
        // replace params between {url} by id in consent
        const url = params.representationUrl.replace(Regexes.urlParams, () => {
            return user.url;
        });

        const [postData] = await handle(
            postRepresentation(
                params.method,
                url,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return postData;
    }
    //else we POST data
    else {
        const [postData] = await handle(
            postRepresentation(
                params.method,
                params.representationUrl,
                params.data,
                params.credential,
                params.decryptedConsent
            )
        );

        return postData;
    }
};

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
                        'PEP Error'
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
                        getRepresentation(
                            dataResourceSD.representation?.method,
                            dataResourceSD.representation.url,
                            dataResourceSD.representation?.credential,
                            decryptedConsent
                        )
                    );

                    // POST the data to the import service
                    const importResponse = await axios({
                        url: (decryptedConsent as any).dataConsumer.endpoints
                            .dataImport,
                        method: 'POST',
                        data: {
                            data: data,
                            user: (decryptedConsent as any)
                                .consumerUserIdentifier.identifier,
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
                    return {
                        exchange: await dataExchange.updateStatus(
                            DataExchangeStatusEnum.EXPORT_SUCCESS
                        ),
                    };
                } else {
                    return {
                        exchange: await dataExchange.updateStatus(
                            DataExchangeStatusEnum.PEP_ERROR,
                            'PEP Error'
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
