export type ConsentImportPayload = {
    /**
     * The RSA signed consent
     */
    signedConsent: string;

    /**
     * Only concerns Interoperability services
     * @experimental
     */
    isInteropProtocol: boolean;

    /**
     * The URL of the Export Service to which the data request
     * should be made
     */
    serviceExportUrl: string;
    dataImportUrl: string;
};
