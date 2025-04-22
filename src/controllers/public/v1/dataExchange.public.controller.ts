import { NextFunction, Request, Response } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { DataExchange } from '../../../utils/types/dataExchange';
import { DataExchangeStatusEnum } from '../../../utils/enums/dataExchangeStatusEnum';

/**
 * create a data exchange
 * @param req
 * @param res
 * @param next
 */
export const createDataExchange = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dataExchange = await DataExchange.create({ ...req.body });
        await dataExchange.syncWithParticipant();
        return restfulResponse(res, 200, dataExchange);
    } catch (err) {
        next(err);
    }
};

/**
 * get all data exchanges
 * @param req
 * @param res
 * @param next
 */
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

/**
 * get a data exchange by id
 * @param req
 * @param res
 * @param next
 */
export const getDataExchangeById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const dataExchange = await DataExchange.findById(req.params.id);
        if (!dataExchange) {
            return restfulResponse(res, 404, {
                error: 'Data exchange not found',
            });
        }
        return restfulResponse(res, 200, dataExchange);
    } catch (err) {
        next(err);
    }
};

/**
 * update a data exchange
 * @param req
 * @param res
 * @param next
 */
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

        if (!dataExchange) {
            return restfulResponse(res, 404, {
                error: 'Data exchange not found',
            });
        }

        return restfulResponse(res, 200, dataExchange);
    } catch (err) {
        next(err);
    }
};

/**
 * update a data exchange
 * @param req
 * @param res
 * @param next
 */
export const updateDataExchangeDataProcessing = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id, index } = req.params;

        const dataExchange = await DataExchange.findById(req.params.id);

        if (!dataExchange) {
            return restfulResponse(res, 404, {
                error: 'Data exchange not found',
            });
        }

        dataExchange.serviceChain.services[parseInt(index)].completed = true;

        if (parseInt(index) === dataExchange.serviceChain.services.length - 1) {
            await dataExchange.updateStatus(
                DataExchangeStatusEnum.IMPORT_SUCCESS
            );
        }

        await dataExchange.save();

        return restfulResponse(res, 200, dataExchange);
    } catch (err) {
        next(err);
    }
};

/**
 * change the status of the data exchange to error and return a restfull response
 * @param req
 * @param res
 */
export const error = async (req: Request, res: Response) => {
    const { origin, payload } = req.body;
    const dataExchange = await dataExchangeError(
        req.params.id,
        origin,
        payload
    );
    return restfulResponse(res, 200, dataExchange);
};

/**
 * change the status of the data exchange to success and return a restfull response
 * @param req
 * @param res
 */
export const success = async (req: Request, res: Response) => {
    const { origin } = req.body;
    const dataExchange = await dataExchangeSuccess(req.params.id, origin);
    return restfulResponse(res, 200, dataExchange);
};

/**
 * All the data exchange Error that can occur in the process
 * @param id
 * @param origin
 * @param payload
 */
export const dataExchangeError = async (
    id: string,
    origin: string,
    payload?: string
) => {
    try {
        let status;

        switch (origin) {
            case 'provider':
                status = DataExchangeStatusEnum.PROVIDER_EXPORT_ERROR;
                break;
            case 'consumer':
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

/**
 * all the data exchange success that can occur in the process
 * @param id
 * @param origin
 */
export const dataExchangeSuccess = async (id: string, origin: string) => {
    try {
        let status;

        switch (origin) {
            case 'provider':
                status = DataExchangeStatusEnum.EXPORT_SUCCESS;
                break;
            case 'consumer':
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
