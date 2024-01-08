import mongoose, {connection, Schema} from "mongoose";
import {CatalogEnum} from "../enums/catalogEnum";

interface ICatalog {
    endpoint: string;
    catalogId: string;
    type: CatalogEnum;
    enabled: boolean;
}

const schema = new Schema(
    {
        endpoint: String,
        catalogId: String,
        type: String,
        enabled: Boolean,
    });


const Catalog = connection.model('catalog', schema);

export {ICatalog, Catalog};
