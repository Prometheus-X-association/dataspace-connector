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

const getConfigFile = () => {
    const configPath = path.resolve(__dirname, '../../config.json');
    let conf: IConfiguration;

    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    // eslint-disable-next-line prefer-const
    conf = JSON.parse(rawConfig);
    // if (
    //     !conf.endpoint ||
    //     !conf.serviceKey ||
    //     !conf.secretKey ||
    //     !conf.catalogUri
    // ) {
    //     return null;
    // }
    return conf;
};

const getSecretKey = async () => {
    const conf = await Configuration.findOne({}).lean();

    if (conf?.serviceKey) return conf?.secretKey;
    else return getConfigFile()?.secretKey;
};

const getServiceKey = async () => {
    const conf = await Configuration.findOne({}).lean();

    if (conf?.serviceKey) return conf?.serviceKey;
    else return getConfigFile()?.serviceKey;
};

const getAppKey = async () => {
    const conf = await Configuration.findOne({});
    if (!conf?.appKey) {
        conf.appKey = crypto.randomBytes(64).toString('hex');
        conf.save();
    }
    return conf?.appKey;
};

const getEndpoint = async () => {
    const conf = await Configuration.findOne({}).lean();

    if (conf?.serviceKey) return conf?.endpoint;
    else return getConfigFile()?.endpoint;
};

const getCatalogUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.catalogUri) return conf?.catalogUri;
    else return getConfigFile()?.catalogUri;
};

const getConsentUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.consentUri) return conf?.consentUri;
    else return getConfigFile()?.consentUri;
};

const getContractUri = async () => {
    const conf = await Configuration.findOne({}).lean();
    if (conf?.contractUri) return conf?.contractUri;
    else return getConfigFile()?.contractUri;
};

const setUpConfig = async () => {
    return {
        appKey: crypto.randomBytes(64).toString('hex'),
        serviceKey: await getServiceKey(),
        secretKey: await getSecretKey(),
        endpoint: await getEndpoint(),
        catalogUri: await getCatalogUri(),
    };
};

const setupCredentials = async () => {
    if (getConfigFile().credentials.length > 0) {
        for (const cred of getConfigFile().credentials) {
            await Credential.findOneAndUpdate(
                { _id: cred._id },
                { ...cred },
                { upsert: true }
            );
        }
    }
};

const configurationSetUp = async () => {
    try {
        if (!(await getAppKey())) {
            await Configuration.create(await setUpConfig());
        } else {
            if (
                getConfigFile().secretKey !== '' &&
                (await getSecretKey()) !== getConfigFile().secretKey
            ) {
                await Configuration.findOneAndUpdate(
                    {},
                    {
                        secretKey: getConfigFile().secretKey,
                    }
                );
            }

            if (
                getConfigFile().serviceKey !== '' &&
                (await getServiceKey()) !== getConfigFile().serviceKey
            ) {
                await Configuration.findOneAndUpdate(
                    {},
                    {
                        serviceKey: getConfigFile().serviceKey,
                    }
                );
            }
        }
        await setupCredentials();
    } catch (error) {
        Logger.error(error);
    }
};

const registerSelfDescription = async () => {
    try {
        if (
            (await getServiceKey()) &&
            (await getSecretKey()) &&
            (await getCatalogUri()) &&
            (await getEndpoint())
        ) {
            const { token } = await generateBearerTokenFromSecret();

            const checkNeedRegister = await axios.post(
                `${await getCatalogUri()}participants/check`,
                {
                    appKey: await getAppKey(),
                    endpoint: await getEndpoint(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!checkNeedRegister.data.dataspaceConnectorRegistered) {
                const res = await axios.post(
                    `${await getCatalogUri()}participants`,
                    {
                        appKey: await getAppKey(),
                        endpoint: await getEndpoint(),
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
                            endpoint: `${await getCatalogUri()}${
                                CatalogEnum.SERVICE_OFFERING
                            }/${so._id}`,
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
                            endpoint: `${await getCatalogUri()}catalog/${
                                CatalogEnum.SOFTWARE_RESOURCE
                            }/${sr._id}`,
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
                            endpoint: `${await getCatalogUri()}${
                                CatalogEnum.DATA_RESOURCE
                            }/${dr._id}`,
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
        Logger.error(error);
    }
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
};
