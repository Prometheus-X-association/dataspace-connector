import { Request, Response, NextFunction } from "express";
import {restfulResponse} from "../../../libs/api/RESTfulResponse";
import {Credential} from "../../../utils/types/credential";

export const getCredentials = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await Credential.find().lean();

        return restfulResponse(res, 200, credential)
    } catch (err) {
        next(err);
    }
};

export const getCredentialById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await Credential.findById(req.params.id).lean();

        return restfulResponse(res, 200, credential)
    } catch (err) {
        next(err);
    }
};

export const createCredential = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {type, key, value} = req.body

        console.log(type, key, value)

        const credential = await Credential.create({
            type,
            key,
            value
        });

        return restfulResponse(res, 201, credential)
    } catch (err) {
        next(err);
    }
};


export const updateCredential = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await Credential.findByIdAndUpdate(req.params.id, {
            ...req.body
        })

        return restfulResponse(res, 200, credential)
    } catch (err) {
        next(err);
    }
};
