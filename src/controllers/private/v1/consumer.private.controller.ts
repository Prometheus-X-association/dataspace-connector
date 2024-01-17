import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import axios from 'axios';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { DataExchange } from '../../../utils/types/dataExchange';
import {
    dataExchangeError,
    dataExchangeSuccess,
} from '../../public/v1/dataExchange.public.controller';
import { Catalog } from '../../../utils/types/catalog';
import { Logger } from '../../../libs/loggers';
import { generateBearerTokenFromSecret } from '../../../libs/jwt';

export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        const { providerEndpoint, resourceId, contractId } = req.body;

        // TODO
        //Contract verification
        //get the contract to retrieve the providerEndpoint
        //get the softwareResource endpoint

        //Create a data Exchange
        const dataExchange = await DataExchange.create({
            providerEndpoint: providerEndpoint,
            resourceId: resourceId,
            contractId: contractId,
            status: 'PENDING',
            createdAt: new Date(),
        });

        //Trigger provider endpoint exchange
        await axios.post(`${providerEndpoint}provider/export`, {
            resourceId,
            consumerEndpoint: await getEndpoint(),
            dataExchangeId: dataExchange._id,
        });
    } catch (err) {
        next(err);
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
        const contract = await axios.get(
            `http://host.docker.internal:8888/bilaterals/${dataExchange.contractId}`
        );

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

        if (!endpoint) {
            await dataExchangeError(dataExchangeId, 'consumer');
        } else {
            await dataExchangeSuccess(dataExchangeId, 'consumer');

            await axios.post(endpoint, data).catch((err) => Logger.error(err));
        }
    } catch (err) {
        next(err);
    }
};
