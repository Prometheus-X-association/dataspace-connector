import { Request, Response, NextFunction } from 'express';
import {
    getAppKey,
    getEndpoint,
    getServiceKey,
} from '../../../libs/loaders/configuration';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { Catalog } from '../../../utils/types/catalog';
import { version } from './../../../../package.json';
import { urlChecker } from '../../../utils/urlChecker';

/**
 * Get the self-description of the connector
 * @param req
 * @param res
 * @param next
 */
export const getSelfDescription = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const endpoint = await getEndpoint();

        const catalog = await Catalog.find({ enabled: true })
            .select('-enabled')
            .lean();

        const selfDescription = {
            '@context': {
                ptx: 'https://w3id.org/ptxa/core/',
                ptxc: 'https://w3id.org/ptxa/code/',
            },
            '@id': 'https://w3id.org/ptx/',
            '@type': 'ptx:BaseConnector',
            _links: {
                self: {
                    href: endpoint,
                },
                consentConfiguration: {
                    href: urlChecker(endpoint, 'private/configuration/consent'),
                },
                login: {
                    href: urlChecker(endpoint, 'login'),
                },
                dataImport: {
                    href: urlChecker(endpoint, 'data/import'),
                },
                dataExport: {
                    href: urlChecker(endpoint, 'data/export'),
                },
                consentImport: {
                    href: urlChecker(endpoint, 'consent/import'),
                },
                consentExport: {
                    href: urlChecker(endpoint, 'consent/export'),
                },
                providerExport: {
                    href: urlChecker(endpoint, 'provider/export'),
                },
                consumerExchange: {
                    href: urlChecker(endpoint, 'consumer/exchange'),
                },
                consumerImport: {
                    href: urlChecker(endpoint, 'consumer/import'),
                },
                infrastructure: {
                    href: urlChecker(endpoint, 'infrastructure'),
                },
            },
            'ptx:ModelVersion': '2.6.0',
            'ptx:appKey': {
                '@type': 'ptx:AppKey',
                '@id': 'https://w3id.org/ptx/',
                'ptx:keyType': {
                    '@id': 'https://w3id.org/ptxa/code/RSA',
                },
                'ptx:keyValue': await getAppKey(),
            },
            'ptx:catalog': [{}],
            'ptx:curator': {
                '@id': process.env.CURATOR,
            },
            'ptx:description': [
                {
                    '@value': 'Prometheus Connector reference implementation',
                    '@type': 'http://www.w3.org/2001/XMLSchema#string',
                },
            ],
            'ptx:hasDefaultEndpoint': {
                '@type': 'ptx:ConnectorEndpoint',
                '@id': 'https://w3id.org/ptx/',
                'ptx:accessURL': {
                    '@id': endpoint,
                },
            },
            'ptx:maintainer': {
                '@id': process.env.MAINTAINER,
            },
            'ptx:securityProfile': {
                '@id': 'https://w3id.org/ptx/',
            },
            'ptx:serviceKey': {
                '@type': 'ptx:ServiceKey',
                '@id': 'https://w3id.org/ptx/',
                'ptx:keyType': {
                    '@id': 'https://w3id.org/ptxa/code/RSA',
                },
                'ptx:keyValue': await getServiceKey(),
            },
            'ptx:title': [
                {
                    '@value': 'Dataspace Connector',
                    '@type': 'http://www.w3.org/',
                },
            ],
            'ptx:version': version,
        };

        if (catalog.length > 0) {
            const cat: { '@type': string; '@id': string }[] = [];

            catalog.forEach((c) => {
                cat.push({
                    '@type': `ptx:${c.type}`,
                    '@id': c.endpoint,
                });
            });

            selfDescription['ptx:catalog'] = cat;
        }

        return restfulResponse(res, 200, selfDescription);
    } catch (err) {
        return restfulResponse(res, 500, []);
    }
};
