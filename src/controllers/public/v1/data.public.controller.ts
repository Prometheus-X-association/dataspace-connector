import { NextFunction, Request, Response } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Logger } from '../../../libs/loggers';
import { validateConsent } from '../../../libs/services/validateConsent';
import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/services/catalog';
import { Regexes } from '../../../utils/regexes';
import {pepLeftOperandsVerification, pepVerification} from '../../../utils/pepVerification';
import {
    getRepresentation,
    postRepresentation,
    putRepresentation,
} from '../../../libs/loaders/representationFetcher';
import {DataExchangeStatusEnum} from "../../../utils/enums/dataExchangeStatusEnum";
import {processLeftOperands} from "../../../utils/leftOperandProcessor";
import {DataExchange} from "../../../utils/types/dataExchange";

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
    const dataExchange = await DataExchange.findById(decryptedConsent.providerDataExchangeId)

    try {

        // Send validation verification to VisionsTrust to receive user info and DataTypes
        const validation = await validateConsent(signedConsent, encrypted);

        //eslint-disable-next-line
        const { verified } = validation;

        if (!verified) {
            throw new Error('consent not verified.');
        }

        const {pep} = await pepVerification({
            targetResource: decryptedConsent.data[0],
            referenceURL: decryptedConsent.contract,
        });

        if (pep) {
            const [serviceOfferingSD] = await handle(
                getCatalogData((decryptedConsent as any).data[0])
            );

            const [dataResourceSD] = await handle(
                getCatalogData((serviceOfferingSD as any).dataResources[0])
            );

            // Use the replace method with a callback function to replace the text between "{ }"
            const url = dataResourceSD.representation.url.replace(
                Regexes.urlParams,
                () => {
                    return (decryptedConsent as any).providerUserIdentifier
                        .identifier;
                }
            );

            const [data] = await handle(
                getRepresentation(
                    dataResourceSD.representation?.method,
                    url,
                    dataResourceSD.representation?.credential
                )
            );

            // POST the data to the import service
            const importResponse = await axios({
                url: (decryptedConsent as any).dataConsumer.endpoints
                    .dataImport,
                method: 'POST',
                data: {
                    data: data,
                    user: (decryptedConsent as any).consumerUserIdentifier
                        .identifier,
                    signedConsent: signedConsent,
                    encrypted,
                    apiResponseRepresentation: !!(dataResourceSD.isPayloadForAPI && dataResourceSD.apiResponseRepresentation)
                },
            });

            // Process left Operands incrementation
            if (importResponse?.data?.message === "OK") {
                const names = await pepLeftOperandsVerification({
                    targetResource: decryptedConsent.data[0],
                    referenceURL: decryptedConsent.contract,
                })
                await processLeftOperands(names, decryptedConsent.contract, decryptedConsent.data[0]);
            }
        } else {
            // @ts-ignore
            await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR)
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        // @ts-ignore
        await dataExchange.updateStatus(DataExchangeStatusEnum.CONSENT_EXPORT_ERROR, err.message)
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
    const { data, user, signedConsent, encrypted, apiResponseRepresentation, isPayload } = req.body;

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
        providerDataExchange: decryptedConsent.providerDataExchangeId
    })

    try {
        const {pep} = await pepVerification({
            targetResource: decryptedConsent.purposes[0].purpose,
            referenceURL: decryptedConsent.contract,
        });

        if (pep) {
            //If the import is a payload from the consumer
            if(isPayload){
                const [serviceOfferingSD] = await handle(
                    getCatalogData((decryptedConsent as any).data[0])
                );

                const [dataResourceSD] = await handle(
                    getCatalogData((serviceOfferingSD as any).dataResources[0])
                );

                await postOrPutRepresentation({
                    method: dataResourceSD?.apiResponseRepresentation?.method,
                    representationUrl: dataResourceSD?.apiResponseRepresentation.url,
                    data,
                    credential: dataResourceSD?.apiResponseRepresentation?.credential,
                    user
                })

            } else {
                const [serviceOfferingSD] = await handle(
                    getCatalogData(decryptedConsent.purposes[0].purpose)
                );

                const [softwareResourceSD] = await handle(
                    getCatalogData(serviceOfferingSD.softwareResources[0])
                );

                const payload = await postOrPutRepresentation({
                    method: softwareResourceSD.representation?.method,
                    representationUrl: softwareResourceSD.representation.url,
                    data,
                    credential: softwareResourceSD.representation?.credential,
                    user
                })

                if(softwareResourceSD.isAPI){
                    if(apiResponseRepresentation){
                        await axios({
                            url: (decryptedConsent as any).dataProvider.endpoints
                                .dataImport,
                            method: 'POST',
                            data: {
                                data: payload,
                                user: (decryptedConsent as any).providerUserIdentifier
                                    .identifier,
                                signedConsent: signedConsent,
                                encrypted,
                                isPayload: true
                            },
                        })
                    }
                }
                // @ts-ignore
                await dataExchange.updateStatus(DataExchangeStatusEnum.IMPORT_SUCCESS)
            }
        } else {
            // @ts-ignore
            await dataExchange.updateStatus(DataExchangeStatusEnum.PEP_ERROR)
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
        // @ts-ignore
        await dataExchange.updateStatus(DataExchangeStatusEnum.CONSENT_IMPORT_ERROR, err.message)
    }
};

/**
 * Post or Put data to given representation
 * @param params
 * @return Promise<any>
 */
const postOrPutRepresentation = async (
    params: {
        representationUrl: string,
        data: any,
        method: string,
        credential: string,
        user: any
    }) => {

    // if contains params in URL is PUT Method
    if (params.representationUrl.match(Regexes.urlParams)) {
        if (params.data._id) delete params.data._id;

        // replace params between {} by id in consent
        const url = params.representationUrl.replace(Regexes.urlParams, () => {
            return params.user;
        });

        const [updateData] =
            await handle(
                putRepresentation(
                    params.method,
                    url,
                    params.data,
                    params.credential
                )
            );

        return updateData;

    }
    //else we POST data
    else {
        const [postData] = await handle(
            postRepresentation(
                params.method,
                params.representationUrl,
                params.data,
                params.credential
            )
        );

        return postData;
    }
}
