import { NextFunction, Request, Response } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Logger } from '../../../libs/loggers';
import { validateConsent } from '../../../libs/services/validateConsent';
import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/services/catalog';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { Regexes } from '../../../utils/regexes';
import { pepVerification } from '../../../utils/pepVerification';
import {
    getRepresentation,
    postRepresentation,
    putRepresentation,
} from '../../../libs/loaders/representationFetcher';

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
    try {
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

        // Send validation verification to VisionsTrust to receive user info and DataTypes
        const validation = await validateConsent(signedConsent, encrypted);

        //eslint-disable-next-line
        const { verified } = validation;

        if (!verified) {
            throw new Error('consent not verified.');
        }

        const pep = await pepVerification({
            targetResource: decryptedConsent.data[0],
            referenceURL: decryptedConsent.contract,
        });

        if (pep) {
            const [serviceOfferingSD, serviceOfferingSDError] = await handle(
                getCatalogData((decryptedConsent as any).data[0])
            );

            if (serviceOfferingSDError) {
                Logger.error({
                    message: serviceOfferingSDError,
                    location: 'exportData - serviceOfferingSDError',
                });
                return restfulResponse(res, 400, { success: false });
            }

            const [dataResourceSD, dataResourceSDError] = await handle(
                getCatalogData((serviceOfferingSD as any).dataResources[0])
            );

            if (dataResourceSDError) {
                Logger.error({
                    message: dataResourceSDError,
                    location: 'exportData - dataResourceSDError',
                });
                return restfulResponse(res, 400, { success: false });
            }

            // Use the replace method with a callback function to replace the text between "{ }"
            const url = dataResourceSD.representation.url.replace(
                Regexes.urlParams,
                () => {
                    return (decryptedConsent as any).providerUserIdentifier
                        .identifier;
                }
            );

            const [data, dataError] = await handle(
                getRepresentation(
                    dataResourceSD.representation?.method,
                    url,
                    dataResourceSD.representation?.credential
                )
            );

            if (dataError) {
                Logger.error({
                    message: dataError,
                    location: 'exportData - dataError',
                });
                return restfulResponse(res, 400, { success: false });
            }

            // POST the data to the import service
            await axios({
                url: (decryptedConsent as any).dataConsumer.endpoints
                    .dataImport,
                method: 'POST',
                data: {
                    data: data,
                    user: (decryptedConsent as any).consumerUserIdentifier
                        .identifier,
                    signedConsent: signedConsent,
                    encrypted,
                },
            });
        }
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
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
    try {
        //eslint-disable-next-line
        const { data, user, signedConsent, encrypted } = req.body;

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

        const pep = await pepVerification({
            targetResource: decryptedConsent.data[0],
            referenceURL: decryptedConsent.contract,
        });

        if (pep) {
            const [serviceOfferingSD, serviceOfferingSDError] = await handle(
                getCatalogData(decryptedConsent.purposes[0].purpose)
            );

            if (serviceOfferingSDError) {
                Logger.error({
                    message: serviceOfferingSDError,
                    location: 'importData - serviceOfferingSDError',
                });
                return restfulResponse(res, 400, { success: false });
            }

            const [softwareResourceSD, softwareResourceSDError] = await handle(
                getCatalogData(serviceOfferingSD.softwareResources[0])
            );

            if (softwareResourceSDError) {
                Logger.error({
                    message: softwareResourceSDError,
                    location: 'importData - softwareResourceSDError',
                });
                return restfulResponse(res, 400, { success: false });
            }

            const representationUrl = softwareResourceSD.representation.url;
            if (representationUrl.match(Regexes.urlParams)) {
                if (data._id) delete data._id;

                const url = representationUrl.replace(Regexes.urlParams, () => {
                    return user;
                });

                const [updateConsumerAPI, updateConsumerAPIError] =
                    await handle(
                        putRepresentation(
                            softwareResourceSD.representation?.method,
                            url,
                            data,
                            softwareResourceSD.representation?.credential
                        )
                    );

                if (updateConsumerAPIError) {
                    Logger.error({
                        message: updateConsumerAPIError,
                        location: 'importData - updateConsumerAPIError',
                    });
                    return restfulResponse(res, 400, { success: false });
                }
            } else {
                const [postConsumerAPI, postConsumerAPIError] = await handle(
                    postRepresentation(
                        softwareResourceSD.representation?.method,
                        representationUrl,
                        data,
                        softwareResourceSD.representation?.credential
                    )
                );

                if (postConsumerAPIError) {
                    Logger.error({
                        message: postConsumerAPIError,
                        location: 'importData - postConsumerAPIError',
                    });
                    return restfulResponse(res, 400, { success: false });
                }
            }
        }

        res.status(200).json({ message: 'OK' });
    } catch (err) {
        Logger.error({
            message: err.message,
            location: err.stack,
        });
    }
};
