import catalogPrivateRouter from './catalog.private.router';
import configurationPrivateRouter from './configuration.private.router';
import credentialsPrivateRouter from './credentials.private.router';
import userPrivateRouter from './user.private.router';
import consentPrivateRouter from './consent.private.router';
import pdiPrivateRouter from './pdi.private.router';
import infrastructureConfigurationPrivateRouter from './infrastructure.configuration.private.router';
import kpiPrivateRouter from './kpi.private.router';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwt:
 *       type: http
 *       scheme: bearer
 *     exchangeTriggerAPIKey:
 *       type: apiKey
 *       in: header
 *       name: x-exchange-trigger-api-key
 *     kpiApiKey:
 *       type: apiKey
 *       in: header
 *       name: x-kpi-api-key
 *       description: Static API key for KPI routes. Must match the KPI_API_KEY environment variable.
 */

const routers = [
    {
        prefix: '/catalogs',
        router: catalogPrivateRouter,
    },
    {
        prefix: '/configuration',
        router: configurationPrivateRouter,
    },
    {
        prefix: '/credentials',
        router: credentialsPrivateRouter,
    },
    {
        prefix: '/users',
        router: userPrivateRouter,
    },
    {
        prefix: '/consent',
        router: consentPrivateRouter,
    },
    {
        prefix: '/pdi',
        router: pdiPrivateRouter,
    },
    {
        prefix: '/infrastructure/configurations',
        router: infrastructureConfigurationPrivateRouter,
    },
    {
        prefix: '/kpis',
        router: kpiPrivateRouter,
    },
];

export default {
    prefix: '/private',
    routers,
};
