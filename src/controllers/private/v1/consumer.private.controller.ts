import { Request, Response, NextFunction } from "express";
import { restfulResponse } from "../../../libs/api/RESTfulResponse";
import axios from "axios";
import { getEndpoint } from "../../../libs/loaders/configuration";
import { DataExchange } from "../../../utils/types/dataExchange";
import { dataExchangeError, dataExchangeSuccess } from "../../public/v1/dataExchange.public.controller";

export const consumerExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //req.body
        const { providerEndpoint, resourceId } = req.body;

        // TODO
        //Contract verification
        //get the contract to retrieve the providerEndpoint
        //get the softwareResource endpoint

        //Create a data Exchange
        const dataExchange = await DataExchange.create({
            providerEndpoint: providerEndpoint,
            resourceId: resourceId,
            status: "PENDING",
            createdAt: new Date(),
        });

        //Trigger provider endpoint exchange
        await axios.post(
            // `${providerEndpoint}provider/export`,
            `http://dsc-provider:3000/provider/export`,
            {
                resourceId,
                consumerEndpoint: await getEndpoint(),
                dataExchangeId: dataExchange._id,
            }
            // {
            // headers: {
            //     Authorization: `Bearer ${token}`,
            // },
            // }
        );
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

        //Get dataExchangeId

        console.log("dataExchangeId", dataExchangeId);
        console.log("data", data);

        //retrieve endpoint

        //Import data to endpoint of softwareResource
        const endpoint = true;

        if (!endpoint) {
            await dataExchangeError(dataExchangeId, "consumer");
        } else {
            await dataExchangeSuccess(dataExchangeId, "consumer");
        }
        // const checkNeedRegister = await axios.post(
        //     `${providerEndpoint}data/export`,
        //     {
        //         resourceId,
        //         consumerEndpoint: await getEndpoint(),
        //         //dataExchangeId
        //     }
        //     // {
        //     // headers: {
        //     //     Authorization: `Bearer ${token}`,
        //     // },
        //     // }
        // );

        return restfulResponse(res, 200, {});
    } catch (err) {
        next(err);
    }
};
