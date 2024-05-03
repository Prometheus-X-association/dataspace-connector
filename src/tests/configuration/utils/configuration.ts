import express from 'express';

const app = express();
app.disable('x-powered-by');

const startServer = async (port: number) => {
    return app.listen(port, () => {
        process.stdout.write(`Server is listening at http://localhost:${port}`);
    });
};

export default { app, startServer };
