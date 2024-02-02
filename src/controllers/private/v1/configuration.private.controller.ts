import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../../../utils/types/configuration';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { registerSelfDescription, reloadConfigurationFromFile } from "../../../libs/loaders/configuration";
import fs from 'fs';
import path from 'path';

/**
 * Get the configuration of the Data space connector
 * @param req
 * @param res
 * @param next
 */
export const getConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await Configuration.findOne({});

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * update the configuration
 * @param req
 * @param res
 * @param next
 */
export const updateConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await Configuration.findOneAndUpdate(
            {},
            {
                ...req.body,
            },
            {
                upsert: true,
                new: true,
            }
        );

        await registerSelfDescription();

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * update the consent URI of the configuration
 * @param req
 * @param res
 * @param next
 */
export const updateConsentConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await Configuration.findOneAndUpdate(
            {},
            {
                consentUri: req.body.uri,
            },
            {
                upsert: true,
                new: true,
            }
        );

        const publicKey = atob(req.body.publicKey);

        fs.writeFileSync(
            path.join(
                __dirname,
                '..',
                '..',
                '..',
                './keys/consentSignature.pem'
            ),
            publicKey
        );

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * reset the configuration
 * @param req
 * @param res
 * @param next
 */
export const resetConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const configuration = await Configuration.findOneAndDelete({});

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};

/**
 * reload the configuration
 * @param req
 * @param res
 * @param next
 */
export const reloadConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const conf = await reloadConfigurationFromFile();
        //
        return restfulResponse(res, 200, conf);
    } catch (err) {
        next(err);
    }
};
