import { Request, Response, NextFunction } from "express";
import {Configuration} from "../../../utils/types/configuration";
import {restfulResponse} from "../../../libs/api/RESTfulResponse";
import {registerSelfDescription} from "../../../libs/loaders/configuration";

export const updateConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await Configuration.findOneAndUpdate(
            {},
            {
                ...req.body
            },
            {
                upsert: true,
                new: true,
            })

        await registerSelfDescription();

        return restfulResponse(res, 200, configuration)
    } catch (err) {
        next(err);
    }
};
