import fs from 'fs';
import path from 'path';
import { Express, RequestHandler } from 'express';

const importRouter = async (routerPath: string) => {
    const routerModule = await import(routerPath);
    return routerModule.default;
};

export const setupRoutes = async (app: Express) => {
    const routesDir = path.join(__dirname);
    const routerMap = new Map();

    // Load all routers
    for (const accessType of ['private', 'public', 'internal']) {
        const accessTypeDir = path.join(routesDir, accessType);
        for (const version of fs.readdirSync(accessTypeDir)) {
            const versionDir = path.join(accessTypeDir, version);
            for (const routerFile of fs.readdirSync(versionDir)) {
                const routerName = routerFile.split('.')[0];
                const routerPath = `/${version}/${routerName}`;
                const fullPath = path.join(versionDir, routerFile);

                if (!routerMap.has(routerPath)) {
                    routerMap.set(routerPath, {
                        private: null,
                        public: null,
                        internal: null,
                    });
                }

                const router = await importRouter(fullPath);

                if (accessType === 'private') {
                    routerMap.get(routerPath).private = router;
                } else if (accessType === 'internal') {
                    routerMap.get(routerPath).internal = router;
                } else {
                    routerMap.get(routerPath).public = router;
                }
            }
        }
    }

    for (const [basePath, routers] of routerMap) {
        const availableRouters: RequestHandler[] = Object.values(
            routers
        ).filter((router) => router !== null) as RequestHandler[];
        app.use(basePath, ...availableRouters);
    }
};
