import { NextFunction, Request, Response } from 'express';
import { decryptSignedConsent } from '../../../utils/decryptConsent';
import { Logger } from '../../../libs/loggers';
import { validateConsent } from '../../../libs/services/validateConsent';
import axios from 'axios';
import { handle } from '../../../libs/loaders/handler';
import { getCatalogData } from '../../../libs/services/catalog';
import {
    pepLeftOperandsVerification,
    pepVerification,
} from '../../../utils/pepVerification';
import { getRepresentation } from '../../../libs/loaders/representationFetcher';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import { processLeftOperands } from '../../../utils/leftOperandProcessor';
import { DataExchange } from '../../../utils/types/dataExchange';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { importDataService } from '../../../services/public/v1/consumer.public.service';

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

        //eslint-disable-next-line
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
    try {
        const {
            data,
            user,
            signedConsent,
            encrypted,
            apiResponseRepresentation,
            isPayload,
            resource,
        } = req.body;

        const errors = [];
        if (!signedConsent) errors.push('missing signedConsent');
        if (!data) errors.push('missing data');
        if (!user) errors.push('missing user');

        if (errors.length > 0) {
            return restfulResponse(res, 400, {
                error: 'missing params from request payload',
                errors,
            });
        }

        const result = await importDataService({
            data,
            user,
            signedConsent,
            encrypted,
            apiResponseRepresentation,
            isPayload,
            resource,
        });

        if (result.success) {
            return restfulResponse(res, 200, { message: 'OK' });
        } else {
            return restfulResponse(res, 400, {
                error: result.error,
            });
        }
    } catch (error) {
        Logger.error({
            message: error.message,
            location: error.stack,
        });
        return restfulResponse(res, 500, {
            success: false,
            message: 'An unexpected error occurred',
        });
    }
};
