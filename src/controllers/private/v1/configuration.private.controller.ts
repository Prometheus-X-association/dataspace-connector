import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../../../utils/types/configuration';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { registerSelfDescription } from '../../../libs/loaders/configuration';
import fs from 'fs';
import path from 'path';

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
