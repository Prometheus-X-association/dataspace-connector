import { Logger } from '../libs/loggers';

const errorMessages = {
    dataExchange: 'DataExchange not found',
    providerData:
        "Provider data not found in DataExchange, can't perform validation",
    checksum:
        "Checksum not found in DataExchange provider data, can't perform validation",
    mimetype:
        "Mimetype not found in DataExchange provider data, can't perform validation",
    size: "Size not found in DataExchange provider data, can't perform validation",
    contentType:
        "Content-Type header not found in request, can't perform validation",
    contentLength:
        "Content-Length header not found in request, can't perform validation",
    remoteData: "Remote configuration data not found, can't perform validation",
};

export function payloadValidationAssert(
    condition: boolean,
    errorKey: keyof typeof errorMessages
) {
    if (!condition) {
        Logger.error({ message: errorMessages[errorKey] });
        throw new Error(errorMessages[errorKey]);
    }
}
