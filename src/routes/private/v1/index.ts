import templatePrivateRouter from "./template.private.router";
import descriptionPrivateRouter from "./description.private.router";
import catalogPrivateRouter from "./catalog.private.router";
import configurationPrivateRouter from "./configuration.private.router";
import filePrivateRouter from "./file.private.router";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     jwt:
 *       type: apiKey
 *       in: header
 *       name: Authentication
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
];

export default {
    prefix: '/private',
    routers,
};
