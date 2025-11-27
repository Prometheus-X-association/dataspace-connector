import {IncomingHttpHeaders} from "node:http";
import {DataExchange} from "../types/dataExchange";
import {CallbackMeta} from "../types/callbackMeta";
import {CallbackPayload} from "dpcp-library";
import {checksum} from "../../functions/checksum.function";
import {Logger} from "../../libs/loggers";
import {DataExchangeStatusEnum} from "../enums/dataExchangeStatusEnum";
import {getEndpoint} from "../../libs/loaders/configuration";
import {payloadValidationAssert} from "../../errors/payloadValidationError";

/**
 * Verify payload for service chain callback
 * @todo wip
 * @param remoteConfigs
 * @param reqHeaders
 */
export const verifyPayloadServiceChain = async (remoteConfigs: CallbackPayload, reqHeaders: IncomingHttpHeaders) => {
    const dataExchange = await DataExchange.findOne({
        providerDataExchange: (remoteConfigs.meta as CallbackMeta).configuration.dataExchange,
    });

    let message = "";

    try {
        payloadValidationAssert(!!dataExchange, "dataExchange");
        payloadValidationAssert(!!dataExchange?.providerData, "providerData");
        payloadValidationAssert(!!dataExchange?.providerData?.checksum, "checksum");
        payloadValidationAssert(!!dataExchange?.providerData?.mimetype, "mimetype");
        payloadValidationAssert(!!dataExchange?.providerData?.size, "size");
        payloadValidationAssert(!!reqHeaders["content-type"], "contentType");
        payloadValidationAssert(!!reqHeaders["content-length"], "contentLength");
        payloadValidationAssert(!!remoteConfigs.data, "remoteData");

        if(dataExchange.providerData.checksum === checksum(remoteConfigs.data)){
            Logger.info({
                message: `Checksum validation successful for DataExchange ID: ${dataExchange._id}`,
            })
        } else {
            message = `Checksum validation failed for DataExchange ID: ${dataExchange._id}, expected: ${dataExchange.providerData.checksum}, got: ${checksum(remoteConfigs.data)}`
            throw new Error(message);
        }

        if(reqHeaders["content-type"] === dataExchange.providerData.mimetype){
            Logger.info({
                message: `Mimetype validation successful for DataExchange ID: ${dataExchange._id}`,
            })
        } else {
            message = `Mimetype validation failed for DataExchange ID: ${dataExchange._id}, expected: ${dataExchange.providerData.mimetype}, got: ${reqHeaders["content-type"]}`
            throw new Error(message);
        }

        if(Number(reqHeaders["content-length"]) === dataExchange.providerData.size){
            Logger.info({
                message: `Size validation successful for DataExchange ID: ${dataExchange._id}`,
            })
        } else {
            message = `Size validation failed for DataExchange ID: ${dataExchange._id}, expected: ${dataExchange.providerData.size}, got: ${reqHeaders["content-length"]}`
            throw new Error(message);
        }
    } catch(err) {
        Logger.error({
            message,
        })
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.NODE_CALLBACK_ERROR,
            message,
            await getEndpoint(),
        );
        throw err;
    }
}

export const verifyPayloadDefault = async (payload: { dataExchange: string, data: any }, reqHeaders: IncomingHttpHeaders) => {
    const dataExchange = await DataExchange.findOne({
        providerDataExchange: payload.dataExchange,
    });

    let message = "";

    try {
        payloadValidationAssert(!!dataExchange, "dataExchange");
        payloadValidationAssert(!!dataExchange?.providerData, "providerData");
        payloadValidationAssert(!!dataExchange?.providerData?.checksum, "checksum");
        payloadValidationAssert(!!dataExchange?.providerData?.mimetype, "mimetype");
        payloadValidationAssert(!!dataExchange?.providerData?.size, "size");
        payloadValidationAssert(!!reqHeaders["content-type"], "contentType");
        payloadValidationAssert(!!reqHeaders["content-length"], "contentLength");
        payloadValidationAssert(!!payload.data, "remoteData");

        if(dataExchange.providerData.checksum === checksum(payload.data)){
            Logger.info({
                message: `Checksum validation successful for DataExchange ID: ${dataExchange._id}`,
                location: 'verifyPayloadDefault'
            })
        } else {
            message = `Checksum validation failed for DataExchange ID: ${dataExchange._id}, expected: ${dataExchange.providerData.checksum}, got: ${checksum(payload.data)}`
            throw new Error(message);
        }

        if(reqHeaders["content-type"] === dataExchange.providerData.mimetype){
            Logger.info({
                message: `Mimetype validation successful for DataExchange ID: ${dataExchange._id}`,
                location: 'verifyPayloadDefault'
            })
        } else {
            message = `Mimetype validation failed for DataExchange ID: ${dataExchange._id}, expected: ${dataExchange.providerData.mimetype}, got: ${reqHeaders["content-type"]}`
            throw new Error(message);
        }

        if(Number(reqHeaders["content-length"]) === dataExchange.providerData.size){
            Logger.info({
                message: `Size validation successful for DataExchange ID: ${dataExchange._id}`,
                location: 'verifyPayloadDefault'
            })
        } else {
            message = `Size validation failed for DataExchange ID: ${dataExchange._id}, expected: ${dataExchange.providerData.size}, got: ${reqHeaders["content-length"]}`
            throw new Error(message);
        }
    } catch(err) {
        await dataExchange.updateStatus(
            DataExchangeStatusEnum.CONSENT_IMPORT_ERROR,
            message,
            await getEndpoint(),
        );
        throw err;
    }
}