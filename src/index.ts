import { startServer } from "./server";
import { setupEnvironment } from "./config/environment";
import {loadMongoose} from "./libs/loaders/mongoose";

export const main = async (options: { port?: number }) => {
    const { port } = options;
    setupEnvironment();
    await loadMongoose();
    const { server, app } = await startServer(port);
    return { server, app };
};

main({});
