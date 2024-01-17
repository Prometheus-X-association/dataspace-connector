import { UserIdentifier } from './userIdentifier';

/**
 * Returned data after a consent has been successfully
 * verified and validated by VisionsTrust before
 * sending the data to the Import Service
 */
export type ValidationData = {
    /**
     * Verification status of the consent
     */
    verified: boolean;

    /**
     * The user information in the Export Service
     */
    userExport: UserIdentifier;

    /**
     * The user information in the Import Service
     */
    userImport: UserIdentifier;

    /**
     * The URL where the data should be sent back
     */
    dataImportEndpoint: string;

    /**
     * The list of data types the user has consented to
     * and optionally, the table and fields the data corresponds
     * to in the system's database. (Set via the DataTypes registration
     * on VisionsTrust's dashboard)
     */
    datatypes: {
        /**
         * Name of the DataType as registered on VisionsTrust
         */
        name: string;

        /**
         * Name of the table if registered
         */
        table: string | null;

        /**
         * Name of corresponding fields if registered
         */
        fields: string[] | null;
    }[];
};
