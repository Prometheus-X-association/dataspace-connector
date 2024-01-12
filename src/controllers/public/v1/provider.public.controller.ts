import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { getEndpoint } from "../../../libs/loaders/configuration";
import { Catalog } from "../../../utils/types/catalog";

export const providerExport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dataExchangeId, resourceId, consumerEndpoint } = req.body;

        // B to B exchange
        if (dataExchangeId && consumerEndpoint && resourceId) {
            //Contract and policies verification

            //Get the endpoint
            const resource = await Catalog.findOne({
                resourceId: resourceId,
            }).lean();

            if (!resource) {
                await axios.put(
                    // `${providerEndpoint}provider/export`,
                    `http://dsc-consumer:3000/dataexchanges/${dataExchangeId}/error`,
                    {
                        origin: "provider",
                        payload: "No resource Matching",
                    }
                    // {
                    // headers: {
                    //     Authorization: `Bearer ${token}`,
                    // },
                    // }
                );

                throw Error("No resource Matching");
            }

            //Call the catalog endpoint
            const endpointData: any = await axios.get(
                // `${resource.endpoint}provider/export`,
                resource.endpoint.replace("localhost", "host.docker.internal")
                // {
                // headers: {
                //     Authorization: `Bearer ${token}`,
                // },
                // }
            );

            if (!endpointData?.data?.representation) {
                await axios.put(
                    // `${providerEndpoint}provider/export`,
                    `http://dsc-consumer:3000/dataexchanges/${dataExchangeId}/error`,
                    {
                        origin: "provider",
                        payload: "No representation found",
                    }
                    // {
                    // headers: {
                    //     Authorization: `Bearer ${token}`,
                    // },
                    // }
                );

                throw Error("No representation found");
            }

            //Get the DataReprensentation
            //Get the credential

            const data = await axios.get(
                // `${providerEndpoint}provider/export`,
                `${endpointData?.data?.representation?.url.replace("{id}", "")}`
                // {
                // headers: {
                //     Authorization: `Bearer ${token}`,
                // },
                // }
            );

            if (!data) {
                await axios.put(
                    // `${providerEndpoint}provider/export`,
                    `http://dsc-consumer:3000/dataexchanges/${dataExchangeId}/error`,
                    {
                        origin: "provider",
                    }
                    // {
                    // headers: {
                    //     Authorization: `Bearer ${token}`,
                    // },
                    // }
                );
            }

            //Send the data to generic endpoint
            await axios.post(
                // `${providerEndpoint}provider/export`,
                `http://dsc-consumer:3000/private/consumer/import`,
                {
                    data: data.data,
                    dataExchangeId: dataExchangeId,
                }
                // {
                // headers: {
                //     Authorization: `Bearer ${token}`,
                // },
                // }
            );
        }
    } catch (err) {
        next(err);
    }
};
