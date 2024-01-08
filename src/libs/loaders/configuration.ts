import path from "path";
import {Configuration, IConfiguration} from "../../utils/types/configuration";
import fs from "fs";
import axios from "axios";
import crypto from "crypto"
import {generateBearerTokenFromSecret} from "../jwt";
import {Catalog} from "../../utils/types/catalog";
import {CatalogEnum} from "../../utils/enums/catalogEnum";

const getConfigFile = () => {
    const configPath = path.resolve(__dirname, '../../../config.json');
    let conf: IConfiguration;

    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    conf = JSON.parse(rawConfig);
    if(!conf.endpoint || !conf.serviceKey || !conf.secretKey){
        throw new Error('Missing field in configuration')
    }
    return conf;
}

const getSecretKey = async () => {
    const conf = await Configuration.findOne({}).lean();

    if(conf?.serviceKey) return conf?.secretKey;
    else return getConfigFile().secretKey;
}

const getServiceKey = async () => {
    const conf = await Configuration.findOne({}).lean();

    if(conf?.serviceKey) return conf?.serviceKey;
    else return getConfigFile().serviceKey;
}

const getAppKey = async () => {
    const conf = await Configuration.findOne({}).lean();
    return conf?.appKey;
}

const getEndpoint = async () => {
    const conf = await Configuration.findOne({}).lean();

    if(conf?.serviceKey) return conf?.endpoint;
    else return getConfigFile().endpoint;
}

const defaultConfig = async () => {
    return {
        serviceKey: await getServiceKey(),
        secretKey: await getSecretKey()
    }
}

const setUpConfig = async () => {
    return {
        appKey: crypto.randomBytes(64).toString("hex"),
        serviceKey: await getServiceKey(),
        secretKey: await getSecretKey(),
        endpoint: await getEndpoint()
    }
}

const configurationSetUp = async () => {
    try {
        if(!await getAppKey()){
            await Configuration.create(await setUpConfig())
        } else {
            if(await getSecretKey() !== getConfigFile().secretKey){
                await Configuration.findOneAndUpdate({}, {
                    secretKey: getConfigFile().secretKey,
                })
            }

            if(await getServiceKey() !== getConfigFile().serviceKey){
                await Configuration.findOneAndUpdate({}, {
                    serviceKey: getConfigFile().serviceKey,
                })
            }
        }

    } catch (error) {
        throw error
    }
}

const registerSelfDescription = async () => {
    try{

        const {token } = await generateBearerTokenFromSecret()

        const checkNeedRegister =  await axios.post(`${process.env.PTX_URI}/participants/check`, {
                appKey: await getAppKey(),
                endpoint: await getEndpoint(),
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

        if(!checkNeedRegister.data.dataspaceConnectorRegistered){
            const res = await axios.post(`${process.env.PTX_URI}/participants`, {
                appKey: await getAppKey(),
                endpoint: await getEndpoint(),
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            for (const so of res.data.serviceOfferings){
                await Catalog.findOneAndUpdate({catalogId: so._id}, {
                    endpoint: `${process.env.CATALOG_URI}/${CatalogEnum.SERVICE_OFFERING}/${so._id}`,
                    catalogId: so._id,
                    type: CatalogEnum.SERVICE_OFFERING,
                    enabled: true
                }, {upsert: true})
            }

            for (const sr of res.data.softwareResources){
                await Catalog.findOneAndUpdate({catalogId: sr._id}, {
                    endpoint: `${process.env.CATALOG_URI}/${CatalogEnum.SOFTWARE_RESOURCE}/${sr._id}`,
                    catalogId: sr._id,
                    type: CatalogEnum.SOFTWARE_RESOURCE,
                    enabled: true
                }, {upsert: true})
            }

            for (const dr of res.data.dataResources){
                await Catalog.findOneAndUpdate({catalogId: dr._id}, {
                    endpoint: `${process.env.CATALOG_URI}/${CatalogEnum.DATA_RESOURCE}/${dr._id}`,
                    catalogId: dr._id,
                    type: CatalogEnum.DATA_RESOURCE,
                    enabled: true
                }, {upsert: true})
            }
        }
    }
    catch(error){
        console.error(error)
    }
}

export {getConfigFile, getSecretKey, getServiceKey, getEndpoint, getAppKey, configurationSetUp, registerSelfDescription};