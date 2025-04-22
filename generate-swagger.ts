import { writeFile } from 'fs';
// @ts-ignore
import path from 'path';
import { Logger } from './src/libs/loggers';
import { OpenAPIOption } from './openapi-options';
// @ts-ignore
import swaggerJSDoc from 'swagger-jsdoc';

const specs = swaggerJSDoc(OpenAPIOption);

writeFile(
    path.join(__dirname, './docs/swagger.json'),
    JSON.stringify(specs, null, 2),
    (err) => {
        if (err) Logger.error({ message: err.message, location: err.stack });
    }
);
