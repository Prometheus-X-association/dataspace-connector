import mongoose, { connection, Schema } from "mongoose";
import { CatalogEnum } from "../enums/catalogEnum";

interface ICatalog {
    endpoint: string;
    resourceId: string;
    type: CatalogEnum;
    enabled: boolean;
}

const schema = new Schema({
    endpoint: String,
    resourceId: String,
    type: String,
    enabled: Boolean,
});

const Catalog = connection.model("catalog", schema);

export { ICatalog, Catalog };
