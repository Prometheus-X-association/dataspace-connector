import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { Credential } from '../../../utils/types/credential';
import mongoose from 'mongoose';

/**
 * get all the credentials
 * @param req
 * @param res
 * @param next
 */
export const getCredentials = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await Credential.find().lean();

        return restfulResponse(res, 200, credential);
    } catch (err) {
        next(err);
    }
};

/**
 * get a credential by id
 * @param req
 * @param res
 * @param next
 */
export const getCredentialById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await Credential.findById(req.params.id).lean();

        if(!credential){
            return restfulResponse(res, 404, {
                error: "Credential not found"
            });
        }

        return restfulResponse(res, 200, credential);
    } catch (err) {
        next(err);
    }
};

/**
 * create a credential
 * @param req
 * @param res
 * @param next
 */
export const createCredential = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { type, key, value } = req.body;

        const credential = await Credential.create({
            _id: new mongoose.Types.ObjectId(),
            type,
            key,
            value,
        });

        return restfulResponse(res, 201, credential);
    } catch (err) {
        next(err);
    }
};

/**
 * update a credential
 * @param req
 * @param res
 * @param next
 */
export const updateCredential = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await Credential.findByIdAndUpdate(req.params.id, {
            ...req.body,
        });

        if(!credential){
            return restfulResponse(res, 404, {
                error: "Credential not found"
            });
        }

        return restfulResponse(res, 200, credential);
    } catch (err) {
        next(err);
    }
};
