import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange, IDataExchange } from '../../../utils/types/dataExchange';
import { handle } from '../../../libs/loaders/handler';
import { providerExport } from '../../../libs/third-party/provider';
import { Logger } from '../../../libs/loggers';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';
import {
    consumerImportService,
    triggerBilateralFlow,
    triggerEcosystemFlow,
} from '../../../services/public/v1/consumer.public.service';
import { ProviderExportService } from '../../../services/public/v1/provider.public.service';
import { getEndpoint, getProxy } from '../../../libs/loaders/configuration';
import { ExchangeError } from '../../../libs/errors/exchangeError';
import axios from 'axios';
import { verifyPayloadDefault } from '../../../utils/validation/payloadValidation';
import { ObjectId } from 'mongodb';
import { pendingDirectResponseVisualizations } from '../../../libs/loaders/pendingDirectResponseVisualization';
import { rawResponse } from '../../../libs/api/RAWResponse';
import { checkConnectorProxy } from '../../../libs/third-party/proxy';

/**
 * trigger the data exchange between provider and consumer in a bilateral or ecosystem contract
 * @param req
 * @param res
 * @param next
 */
export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        const {
            resources,
            contract,
            resourceId,
            purposeId,
            providerParams,
            consumerParams,
            purposes,
            serviceChainId,
            serviceChainParams,
            data,
            directResponseVisualization,
            visualizationOnly,
        } = req.body;

        //Create a data Exchange
        let dataExchange: IDataExchange;
        let providerEndpoint: string;
        let directResponseVisualizationId: any;
        let callbackPromise: any;

        const startTime = Date.now();
        const parsedExchangeTimeout = Number(process.env.EXCHANGE_TIMEOUT);
        const timeoutSeconds =
            Number.isFinite(parsedExchangeTimeout) && parsedExchangeTimeout > 0
                ? parsedExchangeTimeout
                : 30;
        const timeout = timeoutSeconds * 1000;

        if (directResponseVisualization) {
            directResponseVisualizationId = new ObjectId().toString();
            callbackPromise = new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    pendingDirectResponseVisualizations.delete(
                        directResponseVisualizationId
                    );
                    reject(new Error('Timeout reached'));
                }, timeout);

                pendingDirectResponseVisualizations.set(
                    directResponseVisualizationId,
                    { resolve, reject, timer }
                );
            });
            // Prevent unhandled rejection crashes if the promise is never awaited
            // (e.g. when the connector version check causes the callback path to be skipped)
            callbackPromise.catch(() => {});
        }

        // ecosystem contract
        if (contract.includes('contracts')) {
            const {
                dataExchange: ecosystemDataExchange,
                providerEndpoint: endpoint,
            } = await triggerEcosystemFlow({
                purposeId,
                resourceId,
                contract,
                resources,
                purposes,
                providerParams,
                consumerParams,
                serviceChainId,
                serviceChainParams,
                directResponseVisualizationId,
                data,
            });

            dataExchange = ecosystemDataExchange;
            if (endpoint) providerEndpoint = endpoint;
        } else {
            const {
                dataExchange: bilateralDataExchange,
                providerEndpoint: endpoint,
            } = await triggerBilateralFlow({
                contract,
                resources,
                purposes,
                providerParams,
                consumerParams,
                serviceChainId,
                serviceChainParams,
                directResponseVisualizationId,
                data,
            });

            dataExchange = bilateralDataExchange;
            if (endpoint) providerEndpoint = endpoint;
        }

        if (!dataExchange) {
            throw new ExchangeError(
                'Error when trying to initiate te exchange.',
                'triggerEcosystemFlow',
                500
            );
        }

        if (serviceChainId && dataExchange.serviceChain.services.length > 0) {
            for (const service of dataExchange.serviceChain.services) {
                // Get the infrastructure service information
                const [participantResponse] = await handle(
                    axios.get(
                        service.participant,
                        await checkConnectorProxy({
                            configProxy: getProxy(),
                        })
                    )
                );

                // Find the participant endpoint
                const participantEndpoint =
                    participantResponse.dataspaceEndpoint;

                // Sync the data exchange with the infrastructure
                if (
                    participantEndpoint !== (await getEndpoint()) &&
                    participantEndpoint !== dataExchange?.consumerEndpoint &&
                    participantEndpoint !== dataExchange?.providerEndpoint
                )
                    await dataExchange.syncWithInfrastructure(
                        participantEndpoint
                    );

                if (service.pre && service.pre.length > 0) {
                    for (const prechain of service.pre) {
                        for (const element of prechain) {
                            const [participantResponse] = await handle(
                                axios.get(
                                    element.participant,
                                    await checkConnectorProxy({
                                        configProxy: getProxy(),
                                    })
                                )
                            );

                            // Find the participant endpoint
                            const participantEndpoint =
                                participantResponse.dataspaceEndpoint;

                            if (
                                participantEndpoint !==
                                    dataExchange.consumerEndpoint &&
                                participantEndpoint !== (await getEndpoint())
                            ) {
                                // Sync the data exchange with the infrastructure
                                await dataExchange.syncWithInfrastructure(
                                    participantEndpoint
                                );
                            }
                        }
                    }
                }
            }
        }

        //default protocol and use provider export service
        if (dataExchange.consumerEndpoint) {
            const updatedDataExchange = await DataExchange.findById(
                dataExchange._id
            );

            await ProviderExportService(
                updatedDataExchange.consumerDataExchange,
                data
            );
        }
        //default protocol and request provider
        else {
            if (providerEndpoint === (await getEndpoint())) {
                Logger.error({
                    message: "Can't make request to itself.",
                    location: 'consumerExchange',
                });
                throw new ExchangeError(
                    "Can't make request to itself.",
                    'triggerEcosystemFlow',
                    500
                );
            }
            // Fire and forget - don't wait for provider response
            // The status polling loop below will handle completion
            providerExport(providerEndpoint, dataExchange._id.toString()).catch(
                (err) => {
                    Logger.error({
                        message: `Provider export failed: ${err.message}`,
                        location: 'consumerExchange - providerExport',
                    });
                }
            );
        }

        let message: string;
        let success = false;
        let callbackData: any;
        // return code 200 everything is ok
        while (dataExchange.status === 'PENDING') {
            if (
                directResponseVisualization &&
                directResponseVisualizationId &&
                callbackPromise &&
                (dataExchange.consumerPdcVersion >= '1.11.0' ||
                    dataExchange.providerPdcVersion >= '1.11.0')
            ) {
                try {
                    callbackData = await callbackPromise;
                    dataExchange = await DataExchange.findById(
                        dataExchange._id
                    );
                } catch (err) {
                    message = `${timeoutSeconds} sec Timeout directResponseVisualization reached.`;
                    dataExchange = await DataExchange.findById(
                        dataExchange._id
                    );
                    break;
                }
            } else {
                if (callbackPromise && directResponseVisualizationId) {
                    const { timer } =
                        pendingDirectResponseVisualizations.get(
                            directResponseVisualizationId
                        ) || {};
                    if (timer) {
                        clearTimeout(timer);
                        pendingDirectResponseVisualizations.delete(
                            directResponseVisualizationId
                        );
                    }
                }
                callbackPromise = null;
            }

            if (Date.now() - startTime > timeout) {
                message = `${timeoutSeconds} sec Timeout reached.`;
                break;
            }

            dataExchange = await DataExchange.findById(dataExchange._id);
        }

        if (dataExchange.status === 'IMPORT_SUCCESS') {
            success = true;
        }

        if (directResponseVisualizationId && visualizationOnly) {
            return rawResponse(res, callbackData);
        }

        return restfulResponse(res, 200, {
            success,
            dataExchange,
            message,
            directResponseVisualization: callbackData,
        });
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        return restfulResponse(res, 500, {
            success: false,
            message: e.message,
        });
    }
};

/**
 * import the data from the provider into the consumer software representation
 * @param req
 * @param res
 * @param next
 */
export const consumerImport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let { providerDataExchange, data, apiResponseRepresentation } =
            req.body;

        if (!providerDataExchange) {
            providerDataExchange = req.headers['x-provider-data-exchange'];
        }

        if (!data) {
            data = req.body;
        }

        if (!apiResponseRepresentation) {
            apiResponseRepresentation =
                req.headers['x-api-response-representation'];
        }

        if (!req.headers['content-type'].includes('application/json')) {
            await verifyPayloadDefault(
                { dataExchange: providerDataExchange, data },
                req.headers
            );
        }

        await consumerImportService({
            providerDataExchange,
            data,
            apiResponseRepresentation,
        });

        return restfulResponse(res, 200, { success: true });
    } catch (e) {
        Logger.error({
            message: e.message,
            location: e.stack,
        });

        const dataExchange = await DataExchange.findOne({
            $or: [
                { _id: new ObjectId(req.body.providerDataExchange) },
                { _id: req.body.providerDataExchange },
                { providerDataExchange: req.body.providerDataExchange },
            ],
        });

        await dataExchange?.updateStatus(
            DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR,
            e.message,
            await getEndpoint()
        );

        return restfulResponse(res, 500, { success: false });
    }
};

export const authAPIKeycheck = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    return restfulResponse(res, 200, {
        success: true,
        message: 'API key authentication successful',
    });
};
