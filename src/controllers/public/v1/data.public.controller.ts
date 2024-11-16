import { NextFunction, Request, Response } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Logger } from '../../../libs/loggers';
import { validateConsent } from '../../../libs/third-party/validateConsent';
import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/third-party/catalog';
import { Regexes } from '../../../utils/regexes';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import {
    getRepresentation,
    postRepresentation,
    putRepresentation,
} from '../../../libs/loaders/representationFetcher';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { DataExchange } from '../../../utils/types/dataExchange';
import { User } from '../../../utils/types/user';
import { triggerInfrastructureFlowService } from '../../../services/public/v1/infrastructure.public.service';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import { IDecryptedConsent } from '../../../utils/types/decryptConsent';

/**
 * Export data for the provider in the consent flow
 * @param req
 * @param res
 * @param next
 */
export const exportData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { signedConsent, encrypted } = req.body;

    if (!signedConsent || !encrypted)
        return res.status(400).json({
            error: 'Missing params from request payload',
        });

    // Send OK response to requester
    res.status(200).json({ message: 'OK' });

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
            const { pep } = await pepVerification({
                targetResource: dt.serviceOffering,
                referenceURL: decryptedConsent.contract,
            });

            if (pep) {
                const [dataResourceSD] = await handle(
                    getCatalogData(dt.resource)
                );

                const [data] = await handle(
                    getRepresentation({
                        method: dataResourceSD.representation?.method,
                        endpoint: dataResourceSD.representation.url,
                        credential: dataResourceSD.representation?.credential,
                        decryptedConsent: decryptedConsent,
                    })
                );

                //When the data is retrieved, check wich flow to trigger based infrastructure options
                // the options and the dataProcessings will be represented in the consent
                if (
                    dataExchange.dataProcessing &&
                    dataExchange.dataProcessing.infrastructureServices.length >
                        0
                ) {
                    //Trigger the infrastructure flow
                    await triggerInfrastructureFlowService(
                        dataExchange.dataProcessing,
                        dataExchange,
                        data,
                        signedConsent,
                        encrypted
                    );
                } else {
                    //TODO
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
            } else {
                await dataExchange.updateStatus(
                    DataExchangeStatusEnum.PEP_ERROR
                );
            }
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.CONSENT_EXPORT_ERROR,
            err.message
        );
    }
};

/**
 * Import data endpoint for the consumer in the consent flow
 * @param req
 * @param res
 * @param next
 */
export const importData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    //eslint-disable-next-line
    const { data, user, signedConsent, encrypted, apiResponseRepresentation, isPayload, resource } = req.body;

    const errors = [];
    if (!signedConsent) errors.push('missing signedConsent');
    if (!data) errors.push('missing data');
    if (!user) errors.push('missing user');

    if (errors.length > 0)
        return res
            .status(400)
            .json({ error: 'missing params from request payload', errors });

    //eslint-disable-next-line
    const decryptedConsent = await decryptSignedConsent(signedConsent, encrypted);

    res.status(200).json({ message: 'OK' });

    // Get dataExchange
    const dataExchange = await DataExchange.findOne({
        providerDataExchange: decryptedConsent.providerDataExchangeId,
    });

    try {
        let pep;

        if (decryptedConsent.contract.includes('contracts')) {
            pep = await pepVerification({
                targetResource: decryptedConsent.purposes[0].serviceOffering,
                referenceURL: decryptedConsent.contract,
            });
        } else {
            pep = true;
        }

        if (pep) {
            //If the import is a payload from the consumer
            if (isPayload) {
                const [dataResourceSD] = await handle(getCatalogData(resource));

                await postOrPutRepresentation({
                    decryptedConsent,
                    method: dataResourceSD?.apiResponseRepresentation?.method,
                    representationUrl:
                        dataResourceSD?.apiResponseRepresentation.url,
                    data,
                    credential:
                        dataResourceSD?.apiResponseRepresentation?.credential,
                    user,
                });
            } else {
                const [softwareResourceSD] = await handle(
                    getCatalogData(decryptedConsent.purposes[0].resource)
                );

                const payload = await postOrPutRepresentation({
                    decryptedConsent,
                    method: softwareResourceSD.representation?.method,
                    representationUrl: softwareResourceSD.representation.url,
                    data,
                    credential: softwareResourceSD.representation?.credential,
                    user,
                });

                if (softwareResourceSD.isAPI) {
                    if (apiResponseRepresentation) {
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
                await dataExchange.updateStatus(
                    DataExchangeStatusEnum.IMPORT_SUCCESS
                );
            }
        } else {
            await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR);
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.CONSENT_IMPORT_ERROR,
            err.message
        );
    }
};

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
                referenceURL: decryptedConsent.contract,
            });
            await processLeftOperands(
                names,
                decryptedConsent.contract,
                dt.serviceOffering
            );
        }
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });
    }
};
