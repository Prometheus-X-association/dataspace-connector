import express, { Request, Response, static as expressStatic } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { IncomingMessage, Server, ServerResponse } from "http";
import { config } from "./config/environment";
import { morganLogs } from "./libs/loggers";
import { globalErrorHandler } from "./routes/middlewares/errorHandler.middleware";
import routes from "./libs/loaders/routes";
import { loadMongoose } from "./libs/loaders/mongoose";
import {
    configurationSetUp,
    getConfigFile,
    registerSelfDescription,
} from "./libs/loaders/configuration";
import swaggerJSDoc from "swagger-jsdoc";
import { setup, serve } from "swagger-ui-express";
import { OpenAPIOption } from "../openapi-options";
import path from "path";

export type AppServer = {
    app: express.Application;
    server: Server<typeof IncomingMessage, typeof ServerResponse>;
};

/**
 * Starts the express server
 * @param port Defined only when needed for testing purposes
 * @returns The app and the server, to avoid testing libraries to re-define a server
 */
export const startServer = async (port?: number) => {
    const app = express();

    app.use(cors({ origin: true, credentials: true }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup Swagger JSDoc
    const specs = swaggerJSDoc(OpenAPIOption);
    app.use("/docs", serve, setup(specs));

    app.get("/health", (req: Request, res: Response) => {
        return res.status(200).send("OK");
    });

    app.use("/static", expressStatic(path.join(__dirname, "./public/")));

    if (config.env === "development") {
        app.get("/env", async (req: Request, res: Response) => {
            return res.json(config);
        });
    }

    app.use(morganLogs);

    routes(app);

    app.use(globalErrorHandler);

    //Prettify json response
    app.set("json spaces", 2);

    const PORT = port ? port : config.port;

    if (getConfigFile()) {
        await configurationSetUp().then(
            () => registerSelfDescription(),
            (error) => {
                throw error;
            }
        );
    }

    const server = app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log("Server running on: http://localhost:" + PORT);
    });

    return { app, server } as AppServer;
};
