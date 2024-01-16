import { NextFunction, Request, Response } from "express";
import { restfulResponse } from "../../../libs/api/RESTfulResponse";
import { DataExchange } from "../../../utils/types/dataExchange";
import { DataExchangeStatusEnum } from "../../../utils/enums/dataExchangeStatusEnum";

export const getDataExchanges = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dataExchanges = await DataExchange.find();
        return restfulResponse(res, 200, dataExchanges);
    } catch (err) {
        next(err);
    }
};

export const getDataExchangeById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dataExchange = await DataExchange.findById(req.params.id);
        return restfulResponse(res, 200, dataExchange);
    } catch (err) {
        next(err);
    }
};

export const updateDataExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dataExchange = await DataExchange.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
            }
        );
        return restfulResponse(res, 200, dataExchange);
    } catch (err) {
        next(err);
    }
};

export const error = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { origin, payload } = req.body;
    const dataExchange = await dataExchangeError(
        req.params.id,
        origin,
        payload
    );
    return restfulResponse(res, 200, dataExchange);
};

export const success = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { origin } = req.body;
    const dataExchange = await dataExchangeSuccess(req.params.id, origin);
    return restfulResponse(res, 200, dataExchange);
};

export const dataExchangeError = async (
    id: string,
    origin: string,
    payload?: string
) => {
    try {
        let status;

        switch (origin) {
            case "provider":
                status = DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR;
                break;
            case "consumer":
                status = DataExchangeStatusEnum.CONSUMER_IMPORT_ERROR;
                break;
            default:
                status = DataExchangeStatusEnum.UNDEFINED_ERROR;
                break;
        }

        return await DataExchange.findByIdAndUpdate(id, {
            status: status,
            updatedAt: new Date().getDate(),
            payload,
        });
    } catch (err) {
        throw error;
    }
};

export const dataExchangeSuccess = async (id: string, origin: string) => {
    try {
        let status;

        switch (origin) {
            case "provider":
                status = DataExchangeStatusEnum.EXPORT_SUCCESS;
                break;
            case "consumer":
                status = DataExchangeStatusEnum.IMPORT_SUCCESS;
                break;
            default:
                status = DataExchangeStatusEnum.UNDEFINED_ERROR;
                break;
        }

        return await DataExchange.findByIdAndUpdate(
            id,
            {
                status: status,
                updatedAt: new Date(),
            },
            { new: true }
        );
    } catch (err) {
        throw error;
    }
};
