import { startServer } from "./server";
import { setupEnvironment } from "./config/environment";

export const main = async (options: {   port?: number }) => {
	const {  port } = options;
	setupEnvironment();
	const { server, app } = await startServer(port);
	return { server, app };
};

main({});
