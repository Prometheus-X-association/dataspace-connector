import fs from "fs";
import path from "path";
import { Express } from "express";

const importRouter = async (routerPath: string) => {
    const routerModule = await import(routerPath);
    return routerModule.default;
};

export const setupRoutes = async (app: Express) => {
    const routesDir = path.join(__dirname);
    const routerMap = new Map();

    // Load all routers
    for (const accessType of ["private", "public"]) {
        const accessTypeDir = path.join(routesDir, accessType);
        for (const version of fs.readdirSync(accessTypeDir)) {
            const versionDir = path.join(accessTypeDir, version);
            for (const routerFile of fs.readdirSync(versionDir)) {
                const routerName = routerFile.split(".")[0];
                const routerPath = `/${version}/${routerName}`;
                const fullPath = path.join(versionDir, routerFile);

                if (!routerMap.has(routerPath)) {
                    routerMap.set(routerPath, {
                        private: null,
                        public: null,
                    });
                }

                const router = await importRouter(fullPath);

                if (accessType === "private") {
                    routerMap.get(routerPath).private = router;
                } else {
                    routerMap.get(routerPath).public = router;
                }
            }
        }
    }

    // Apply routers to the app
    for (const [basePath, routers] of routerMap) {
        if (routers.private && routers.public) {
            app.use(basePath, routers.public, routers.private);
        } else if (routers.private) {
            app.use(basePath, routers.private);
        } else if (routers.public) {
            app.use(basePath, routers.public);
        }
    }
};
