/**
 * Contents of the signed consent once decrypted
 */
export interface IDecryptedConsent {
    /**
     * The name of the service exporting data
     */
    serviceExportName: string;

    /**
     * The name of the service importing data
     */
    serviceImportName: string;

    /**
     * The name of the service exporting data
     * @deprecated
     */
    serviceExport: string;

    /**
     * The ID of the user in the Import Service's platform database
     */
    userImportId: string;

    /**
     * The ID of the user in the Export Service's platform database
     */
    userExportId: string;

    /**
     * The email of the user in the Import Service
     */
    emailImport: string;

    /**
     * The email of the user in the Export Service
     */
    emailExport: string;

    /**
     * The ID of the consent. Used to retrieve information
     * on the consented data and purpose
     */
    _id: string;

    /**
     * The access token generated by the Export Service
     * Is only present after the token has been generated
     * and attached to the consent
     */
    token?: string;
}
