import path from "path";
import fs from 'fs';
import { getSecretKey, getServiceKey, registerSelfDescription, reloadConfigurationFromFile } from "../../../libs/loaders/configuration";
import { Configuration, IConfiguration } from "../../../utils/types/configuration";
import { generateBearerTokenForPDI } from "../../../libs/jwt";

/**
 * Get the configuration of the Data space connector
 * @returns IConfiguration
 */
export const getConfigurationService = async () => {    
    const configuration = await Configuration.findOne({});
    return configuration;
};

/**
 * Update the configuration of the Data space connector
 * @param data
 * @returns IConfiguration
 */
export const updateConfigurationService = async (data: IConfiguration) => { 
    const configuration = await Configuration.findOneAndUpdate(
        {},
        {
            ...data,
        },
        {
            upsert: true,
            new: true,
        }
    );

    await registerSelfDescription();
    return configuration;
};

/**
 * Update the consent configuration of the Data space connector
 * @param uri
 * @param key
 * @returns IConfiguration
 */
export const updateConsentConfigurationService = async (uri: string, key: string) => {
    const configuration = await Configuration.findOneAndUpdate(
        {},
        {
            consentUri: uri,
        },
        {
            upsert: true,
            new: true,
        }
    );

    const publicKey = atob(key);

    fs.writeFileSync(
        path.join(
            __dirname,
            '..',
            '..',
            '..',
            './keys/consentSignature.pem'
        ),
        publicKey
    );
    return configuration;
};  

/**
 * Reset the configuration
 * @returns IConfiguration
 */
export const resetConfigurationService = async () => {
    const configuration = await Configuration.findOneAndDelete({});
    return configuration;
};

/**
 * Reload the configuration from the file
 * @returns IConfiguration
 */
export const reloadConfigurationService = async () => {
    const configuration = await reloadConfigurationFromFile();
    return configuration;
};

/**
 * Add a cors origin to the configuration
 * @param data
 * @returns IConfiguration
 */
export const addCorsOriginService = async (origin: string ) => {
    const configuration = await Configuration.findOne({});

    const verify = configuration.modalOrigins.find(el => el.origin === origin);

    const token = await generateBearerTokenForPDI(
        await getServiceKey(),
        origin,
        await getSecretKey()
    );

    if (verify) {
        verify.jwt = token.token;
        configuration.save();
    } else {
        configuration.modalOrigins.push({
            origin: origin,
            jwt: token.token
        });
        configuration.save();
    }
    return configuration;
};

/**
 * Remove a cors origin from the configuration
 * @param id
 * @returns IConfiguration
 */
export const removeCorsOriginService = async (id: string) => {
    const configuration = await Configuration.findOne({});
    const index = configuration.modalOrigins.findIndex((element) => {
        return element._id.toString() === id;
    })
    configuration.modalOrigins.splice(index, 1);
    configuration.save();
    return configuration;
};
