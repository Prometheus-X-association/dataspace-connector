import express from 'express';

const app = express();

const startServer = async (port: number) => {
    return app.listen(port, () => {
        process.stdout.write(`Server is listening at http://localhost:${port}`);
    });
};

export default { app, startServer };
