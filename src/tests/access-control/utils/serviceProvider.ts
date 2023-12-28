import express, { Request, Response } from "express";

const app = express();

app.get("/data", (req: Request, res: Response) => {
    res.json({ context: { count: 5 } });
});

const startServer = async (port: number) => {
    return app.listen(port, () => {
        console.log(`Server is listening at http://localhost:${port}`);
    });
};

export default { app, startServer };
