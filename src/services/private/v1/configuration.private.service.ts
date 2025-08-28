import path from 'path';
import fs from 'fs';
import {
    getSecretKey,
    getServiceKey,
    registerSelfDescription,
    reloadConfigurationFromFile,
} from '../../../libs/loaders/configuration';
import {
    Configuration,
    IConfiguration,
} from '../../../utils/types/configuration';
import { generateBearerTokenForPDI } from '../../../libs/jwt';

/**
 * Get the configuration of the Data space connector
 * @returns IConfiguration
 */
export const getConfigurationService = async () => {
    return Configuration.findOne({});
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
export const updateConsentConfigurationService = async (
    uri: string,
    key: string
) => {
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

    if (__dirname.includes('dist')) {
        const pathFile = path.join(__dirname, '..', '..', '..', './keys');
        const pathFileSrc = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            '..',
            'src',
            'keys'
        );
        fs.writeFileSync(
            path.join(pathFile, './consentSignature.pem'),
            publicKey
        );

        if (!fs.existsSync(path.join(pathFileSrc))) {
            fs.mkdirSync(path.join(pathFileSrc));
        }

        fs.writeFileSync(
            path.join(pathFileSrc, './consentSignature.pem'),
            publicKey
        );
    } else {
        const filePath = path.join(__dirname, '..', '..', '..', './keys');
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }

        fs.writeFileSync(
            path.join(filePath, './consentSignature.pem'),
            publicKey
        );
    }

    return configuration;
};

/**
 * Reset the configuration
 * @returns IConfiguration
 */
export const resetConfigurationService = async () => {
    return Configuration.findOneAndDelete({});
};

/**
 * Reload the configuration from the file
 * @returns IConfiguration
 */
export const reloadConfigurationService = async () => {
    return await reloadConfigurationFromFile();
};

/**
 * Add a cors origin to the configuration
 * @returns IConfiguration
 * @param origin
 */
export const addCorsOriginService = async (origin: string) => {
    const configuration = await Configuration.findOne({});

    const verify = configuration.modalOrigins.find(
        (el) => el.origin === origin
    );

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
            jwt: token.token,
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
    });
    configuration.modalOrigins.splice(index, 1);
    configuration.save();
    return configuration;
};
