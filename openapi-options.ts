export const OpenAPIOption = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Data Space Connector',
            version: '0.1.0',
            description: 'PTX Data Space connector',
        },
    },
    // Path to the API docs
    apis: ['./src/routes/private/v1/*.ts', './src/routes/public/v1/*.ts'],
};
