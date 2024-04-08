import catalogPrivateRouter from './catalog.private.router';
import configurationPrivateRouter from './configuration.private.router';
import credentialsPrivateRouter from './credentials.private.router';
import userPrivateRouter from './user.private.router';
import consentPrivateRouter from './consent.private.router';
import pdiPrivateRouter from "./pdi.private.router";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwt:
 *       type: http
 *       scheme: bearer
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
    // {
    //     prefix: '/files',
    //     router: filePrivateRouter,
    // },
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
];

export default {
    prefix: '/private',
    routers,
};
