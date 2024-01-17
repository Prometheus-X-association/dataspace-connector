import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Catalog } from '../../../utils/types/catalog';
import { consumerError } from '../../../utils/consumerError';
import { generateBearerTokenFromSecret } from '../../../libs/jwt';

export const providerExport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dataExchangeId, resourceId, consumerEndpoint } = req.body;

        //Que PEP policies need contractId and contractURI and resourceId = target, action = use par défaut policy fetcher objet vide pour le moment

        // B to B exchange
        if (dataExchangeId && consumerEndpoint && resourceId) {
            //Contract and policies verification

            //Get the endpoint
            const resource = await Catalog.findOne({
                resourceId: resourceId,
            }).lean();

            if (!resource) {
                await consumerError(
                    consumerEndpoint,
                    dataExchangeId,
                    'No Resource matching'
                );
            }

            //Call the catalog endpoint
            const endpointData: any = await axios
                .get(resource.endpoint)
                .catch(
                    async (error) =>
                        await consumerError(
                            consumerEndpoint,
                            dataExchangeId,
                            error
                        )
                );

            if (!endpointData?.data?.representation) {
                await consumerError(
                    consumerEndpoint,
                    dataExchangeId,
                    'No representation found'
                );
            }

            //Get the DataReprensentation
            //Get the credential

            const { token } = await generateBearerTokenFromSecret();
            const data = await axios
                .get(`${endpointData?.data?.representation?.url}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .catch(
                    async (error) =>
                        await consumerError(
                            consumerEndpoint,
                            dataExchangeId,
                            error
                        )
                );

            if (!data) {
                await consumerError(
                    consumerEndpoint,
                    dataExchangeId,
                    'No Data found'
                );
            }

            //Send the data to generic endpoint
            await axios
                .post(`${consumerEndpoint}private/consumer/import`, {
                    data: data.data,
                    dataExchangeId: dataExchangeId,
                })
                .catch(
                    async (error) =>
                        await consumerError(
                            consumerEndpoint,
                            dataExchangeId,
                            error
                        )
                );
        }
    } catch (err) {
        next(err);
    }
};
