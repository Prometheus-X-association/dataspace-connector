import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import axios from 'axios';
import {
    getContractUri,
    getEndpoint,
} from '../../../libs/loaders/configuration';
import { DataExchange } from '../../../utils/types/dataExchange';
import {
    dataExchangeError,
    dataExchangeSuccess,
} from '../../public/v1/dataExchange.public.controller';
import { Catalog } from '../../../utils/types/catalog';
import { Logger } from '../../../libs/loggers';
import { generateBearerTokenFromSecret } from '../../../libs/jwt';
import { PEP } from '../../../access-control/PolicyEnforcementPoint';

export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        const { providerEndpoint, contract } = req.body;

        const contractResp = await axios.get(contract);

        // TODO
        //Contract verification
        //get the contract to retrieve the providerEndpoint
        //get the softwareResource endpoint

        //retrieve endpoint

        //Create a data Exchange
        const dataExchange = await DataExchange.create({
            providerEndpoint: providerEndpoint,
            resourceId: contractResp.data.serviceOffering,
            contract: contract,
            status: 'PENDING',
            createdAt: new Date(),
        });

        //Trigger provider endpoint exchange
        const resp = await axios.post(`${providerEndpoint}provider/export`, {
            consumerEndpoint: await getEndpoint(),
            dataExchangeId: dataExchange._id,
            contract,
        });

        Logger.info({
            message: resp.data,
            location: 'consumer.exchange -- resp',
        });

        return restfulResponse(res, 200, { success: true });
    } catch (err) {
        Logger.error({
            message: err,
            location: 'ConsumerController.consumerExchange -- catch',
        });
        return restfulResponse(res, 500, { success: false });
    }
};

export const consumerImport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        const { dataExchangeId, data } = req.body;

        const { token } = await generateBearerTokenFromSecret();

        //Get dataExchangeId
        const dataExchange = await DataExchange.findById(dataExchangeId).lean();

        //retrieve endpoint
        const contract = await axios.get(dataExchange.contract);

        //PEP
        const pep = await PEP.requestAction({
            action: 'use',
            targetResource: contract.data.serviceOffering,
            referenceURL: dataExchange.contract,
            referenceDataPath: 'policy',
            fetcherConfig: {},
        });

        Logger.info({
            message: `${pep}`,
            location: 'consumer.import -- PEP',
        });

        if (pep) {
            const catalogSo = await Catalog.findOne({
                resourceId: contract.data.purpose[0]._id,
            }).lean();

            const so = await axios.get(catalogSo.endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const catalogSr = await Catalog.findOne({
                resourceId: so?.data.softwareResources[0],
            }).lean();

            const sr = await axios.get(catalogSr.endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            //Import data to endpoint of softwareResource
            const endpoint = sr?.data?.representation?.url;

            Logger.info({
                message: `${endpoint}`,
                location: 'consumer.import -- endpoint',
            });

            if (!endpoint) {
                await dataExchangeError(dataExchangeId, 'consumer');
            } else {
                await dataExchangeSuccess(dataExchangeId, 'consumer');

                await axios.post(endpoint, data);
            }
            return restfulResponse(res, 200, { success: true });
        } else {
            await dataExchangeError(dataExchangeId, 'consumer');
            return restfulResponse(res, 500, { success: false });
        }
    } catch (err) {
        Logger.error({
            message: err,
            location: 'ConsumerController.consumerImport -- catch',
        });
        return restfulResponse(res, 500, { success: false });
    }
};
