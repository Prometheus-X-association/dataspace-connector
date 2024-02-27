import e, { Application } from 'express';
import PrivateRouterV1 from '../../routes/private/v1';
import InternalRouterV1 from '../../routes/internal/v1';
import PublicRouterV1 from '../../routes/public/v1';

type RouterSetup = {
    prefix: string;
    routers: {
        prefix: string;
        router: e.Router;
    }[];
    middleware?: () => unknown;
};

const routersToSetup = [PrivateRouterV1, InternalRouterV1, PublicRouterV1];

export = (app: Application) => {
    routersToSetup.forEach((config: RouterSetup) => {
        const { prefix, middleware } = config;
        config.routers.forEach((router) => {
            const fullPrefix = prefix + router.prefix;
            // Use middleware, if available, preventing
            // its definition across route configurations.
            const routers = middleware
                ? [middleware, router.router]
                : router.router;
            app.use(fullPrefix, routers);
        });
    });
};
