import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Catalog } from '../../../utils/types/catalog';
import { consumerError } from '../../../utils/consumerError';
import { generateBearerTokenFromSecret } from '../../../libs/jwt';
import { PEP } from '../../../access-control/PolicyEnforcementPoint';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getContractUri } from '../../../libs/loaders/configuration';

export const providerExport = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { dataExchangeId, consumerEndpoint, contractId, contractType } =
            req.body;

        if (!(await getContractUri())) {
            await consumerError(
                consumerEndpoint,
                dataExchangeId,
                'Provider configuration error'
            );
        }

        const contractUri = `${await getContractUri()}${contractType}/${contractId}`;

        const contractResp = await axios.get(contractUri);

        const httpPattern = /^https?:\/\//;

        let serviceOffering: string;

        if (httpPattern.test(contractResp.data.serviceOffering)) {
            // Split the string by backslash and get the last element
            const pathElements = contractResp.data.serviceOffering.split('/');
            serviceOffering = pathElements[pathElements.length - 1];
        } else {
            serviceOffering = contractResp.data.serviceOffering;
        }

        //PEP
        const pep = await PEP.requestAction({
            action: 'use',
            target: serviceOffering,
            contractUrl: contractUri,
            config: {},
        });

        if (pep) {
            const so = await Catalog.findOne({
                resourceId: serviceOffering,
            });

            const serviceOfferingSD: any = await axios
                .get(so.endpoint)
                .catch(
                    async (error) =>
                        await consumerError(
                            consumerEndpoint,
                            dataExchangeId,
                            error
                        )
                );

            const resourceId = serviceOfferingSD.data.dataResources[0];

            // B to B exchange
            if (dataExchangeId && consumerEndpoint && resourceId) {
                //Contract find dataresource

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
                const endpointData: any = await axios.get(resource.endpoint);

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

                return restfulResponse(res, 200, { success: true });
            } else {
                return restfulResponse(res, 500, { success: false });
            }
        }
    } catch (err) {
        next(err);
    }
};
