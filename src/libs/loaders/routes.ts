import { Application } from 'express';
import PrivateRouterV1 from '../../routes/private/v1';
import PublicRouterV1 from '../../routes/public/v1';

const routersToSetup = [PrivateRouterV1, PublicRouterV1];

export = (app: Application) => {
    routersToSetup.forEach((config) => {
        const { prefix } = config;
        config.routers.forEach((router) => {
            const fullPrefix = prefix + router.prefix;
            app.use(fullPrefix, router.router);
        });
    });
};
