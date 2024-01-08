import templatePrivateRouter from "./template.private.router";
import descriptionPrivateRouter from "./description.private.router";
import catalogPrivateRouter from "./catalog.private.router";
import configurationPrivateRouter from "./configuration.private.router";
import filePrivateRouter from "./file.private.router";
import credentialsPrivateRouter from "./credentials.private.router";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwt:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 */

const routers = [
    {
        prefix: '/description',
        router: descriptionPrivateRouter,
    },
    {
        prefix: '/catalogs',
        router: catalogPrivateRouter
    },
    {
        prefix: '/configuration',
        router: configurationPrivateRouter
    },
    {
        prefix: '/files',
        router: filePrivateRouter
    },
    {
        prefix: '/credentials',
        router: credentialsPrivateRouter
    },
];

export default {
    prefix: '/private',
    routers,
};
