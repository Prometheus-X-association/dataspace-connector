import path from 'path';
import { Configuration, IConfiguration } from '../../utils/types/configuration';
import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import { generateBearerTokenFromSecret } from '../jwt';
import { Catalog } from '../../utils/types/catalog';
import { CatalogEnum } from '../../utils/enums/catalogEnum';
import { Logger } from '../loggers';
import { Credential } from '../../utils/types/credential';
import { urlChecker } from '../../utils/urlChecker';
import { handle } from './handler';
import { config } from '../../config/environment';

/**
 * Get the configuration file
 * @returns The configuration file
 */
const getConfigFile = () => {
    const configPath = path.resolve(
        __dirname,
        `../../${config.configurationFile}`
    );
    let conf: IConfiguration;
    try {
        const rawConfig = fs.readFileSync(configPath, 'utf-8');
        conf = JSON.parse(rawConfig);
    } catch (error) {
        // If the file doesn't exist, create it with default values and raise error
        if (error.code === 'ENOENT') {
            throw new Error(
                'Please create a config.json file inside the src directory and add the needed variables before building the connector'
            );
        } else {
            // Handle other errors
            Logger.error({
                message: `Error reading or creating config file: ${error.message}`,
                location: 'configuration',
            });
            return null;
        }
    }

    //You can add additional validation here if needed
    const errors = [];

    if (!conf.endpoint) errors.push('endpoint');
    if (!conf.serviceKey) errors.push('serviceKey');
    if (!conf.secretKey) errors.push('secretKey');
    if (!conf.catalogUri) errors.push('catalogUri');
    if (!conf.contractUri) errors.push('contractUri');
    if (!conf.consentUri) errors.push('consentUri');
    if (errors.length > 0) {
        throw Error(
            `Missing variables in the config.json : ${errors.toString()}`
        );
    }

    return conf;
};

/**
 * Get the secret key
 * @returns The secret key
 */
const getSecretKey = async () => {
    const conf = await Configuration.findOne({}).lean();

    if (conf?.serviceKey) return conf?.secretKey;
    else return getConfigFile()?.secretKey;
};

/**
 * Get the service key
 * @returns The service key
 */
const getServiceKey = async () => {
    const conf = await Configuration.findOne({}).lean();

    if (conf?.serviceKey) return conf?.serviceKey;
    else return getConfigFile()?.serviceKey;
};

/**
 * Get the app key
 * @returns The app key
 */
const getAppKey = async () => {
    const conf = await Configuration.findOne({});
    return conf?.appKey;
};

/**
 * Get the endpoint
 * @returns The endpoint
 */
const getEndpoint = async () => {
    const conf = await Configuration.findOne({}).lean();

    if (conf?.serviceKey) return conf?.endpoint;
    else return getConfigFile()?.endpoint;
};

/**
 * Get the catalog uri
 * @returns The catalog uri
 */
const getCatalogUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.catalogUri) return conf?.catalogUri;
    else return getConfigFile()?.catalogUri;
};

/**
 * Get the consent uri
 * @returns The consent uri
 */
const getConsentUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.consentUri) return conf?.consentUri;
    else return getConfigFile()?.consentUri;
};

/**
 * Get the contract uri
 * @returns The contract uri
 */
const getContractUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.contractUri) return conf?.contractUri;
    else return getConfigFile()?.contractUri;
};

/**
 * Get the registration uri
 * @returns The registration uri
 */
const getRegistrationUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.consentUri) return conf?.registrationUri;
    else return getConfigFile()?.registrationUri;
};

/**
 * Get the modal origins
 * @returns The modal origins
 */
const getModalOrigins = async () => {
    const conf = await Configuration.findOne({}).lean();
    return conf?.modalOrigins;
};

/**
 * Get the express limit size
 * @returns The express limit size
 */
const getExpressLimitSize = () => {
    const regex = /^[0-9]+(kb|mb|gb)$/i;
    const limit = getConfigFile()?.expressLimitSize;

    if (regex.test(limit)) {
        return limit;
    } else {
        return null;
    }
};

/**
 * Set up the configuration
 * @returns The configuration
 */
const setUpConfig = async () => {
    return {
        appKey: crypto.randomBytes(64).toString('hex'),
        serviceKey: await getServiceKey(),
        secretKey: await getSecretKey(),
        endpoint: await getEndpoint(),
        catalogUri: await getCatalogUri(),
        contractUri: await getContractUri(),
        consentUri: await getConsentUri(),
        registrationUri: await getRegistrationUri(),
    };
};

/**
 * Setup the credentials
 * @returns The credentials
 */
const setupCredentials = async () => {
    if (getConfigFile()?.credentials?.length > 0) {
        for (const cred of getConfigFile().credentials) {
            await Credential.findOneAndUpdate(
                { _id: cred._id },
                { ...cred },
                { upsert: true }
            );
        }
    }
};

/**
 * Set up the configuration
 * @returns The configuration
 */
const configurationSetUp = async () => {
    try {
        if (!(await getAppKey())) {
            await Configuration.create(await setUpConfig());
        } else {
            //temporary disabled to avoid error
            // if (
            //     getConfigFile().secretKey !== '' &&
            //     (await getSecretKey()) !== getConfigFile().secretKey
            // ) {
            //     await Configuration.findOneAndUpdate(
            //         {},
            //         {
            //             secretKey: getConfigFile().secretKey,
            //         }
            //     );
            // }
            //
            // if (
            //     getConfigFile().serviceKey !== '' &&
            //     (await getServiceKey()) !== getConfigFile().serviceKey
            // ) {
            //     await Configuration.findOneAndUpdate(
            //         {},
            //         {
            //             serviceKey: getConfigFile().serviceKey,
            //         }
            //     );
            // }
        }
        await setupCredentials();
        return true;
    } catch (error) {
        Logger.error({ message: `${error}`, location: 'configurationSetUp' });
        return false;
    }
};

/**
 * Register the self description
 * @returns The self description
 */
const registerSelfDescription = async () => {
    try {
        const catalogURI = await getCatalogUri();
        const endpoint = await getEndpoint();
        const appKey = await getAppKey();

        if (
            (await getServiceKey()) &&
            (await getSecretKey()) &&
            catalogURI &&
            endpoint
        ) {
            const { token } = await generateBearerTokenFromSecret();

            const [checkNeedRegister, checkNeedRegisterError] = await handle(
                axios.post(
                    urlChecker(catalogURI, 'participants/check'),
                    {
                        appKey: appKey,
                        endpoint: endpoint,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
            );

            if (checkNeedRegisterError) {
                Logger.error({
                    message: checkNeedRegisterError.message,
                    location: checkNeedRegisterError.stack,
                });
            }

            if (!checkNeedRegister?.dataspaceConnectorRegistered) {
                const res = await axios.post(
                    urlChecker(catalogURI, 'participants'),
                    {
                        appKey: appKey,
                        endpoint: endpoint,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                for (const so of res.data.serviceOfferings) {
                    await Catalog.findOneAndUpdate(
                        { resourceId: so._id },
                        {
                            endpoint: urlChecker(
                                catalogURI,
                                `catalog/${CatalogEnum.SERVICE_OFFERING}/${so._id}`
                            ),
                            resourceId: so._id,
                            type: CatalogEnum.SERVICE_OFFERING,
                            enabled: true,
                        },
                        { upsert: true }
                    );
                }

                for (const sr of res.data.softwareResources) {
                    await Catalog.findOneAndUpdate(
                        { resourceId: sr._id },
                        {
                            endpoint: urlChecker(
                                catalogURI,
                                `catalog/${CatalogEnum.SOFTWARE_RESOURCE}/${sr._id}`
                            ),
                            resourceId: sr._id,
                            type: CatalogEnum.SOFTWARE_RESOURCE,
                            enabled: true,
                        },
                        { upsert: true }
                    );
                }

                for (const dr of res.data.dataResources) {
                    await Catalog.findOneAndUpdate(
                        { resourceId: dr._id },
                        {
                            endpoint: urlChecker(
                                catalogURI,
                                `catalog/${CatalogEnum.DATA_RESOURCE}/${dr._id}`
                            ),
                            resourceId: dr._id,
                            type: CatalogEnum.DATA_RESOURCE,
                            enabled: true,
                        },
                        { upsert: true }
                    );
                }
            }
        }
    } catch (error) {
        Logger.error({
            message: `${error}`,
            location: 'registerSelfDescription',
        });
    }
};

const reloadConfigurationFromFile = async () => {
    const confFile = getConfigFile();
    const reloadConf = {
        serviceKey: confFile.serviceKey,
        secretKey: confFile.secretKey,
        endpoint: confFile.endpoint,
        catalogUri: confFile.catalogUri,
        contractUri: confFile.contractUri,
        consentUri: confFile.consentUri,
        consentJWT: '',
    };

    const conf = await Configuration.findOneAndUpdate({}, reloadConf, {
        new: true,
    });

    await registerSelfDescription();

    return conf;
};

export {
    getConfigFile,
    getSecretKey,
    getServiceKey,
    getEndpoint,
    getAppKey,
    configurationSetUp,
    registerSelfDescription,
    getCatalogUri,
    getContractUri,
    getConsentUri,
    reloadConfigurationFromFile,
    getRegistrationUri,
    getModalOrigins,
    getExpressLimitSize,
};
