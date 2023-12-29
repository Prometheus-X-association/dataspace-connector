import express, { Request, Response } from "express";

const app = express();

app.get("/data", (req: Request, res: Response) => {
    res.json({ context: { count: 5 } });
});

app.get("/document/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    let document;

    switch (id) {
        case 0:
            document = { document: { id: 0, lang: "en" } };
            break;
        case 1:
            document = { document: { id: 1, lang: "en" } };
            break;
        case 2:
            document = { document: { id: 2, lang: "fr" } };
            break;
        default:
            res.status(404).json({ error: "Document not found" });
            return;
    }

    res.json(document);
});

const startServer = async (port: number) => {
    return app.listen(port, () => {
        console.log(`Server is listening at http://localhost:${port}`);
    });
};

export default { app, startServer };
