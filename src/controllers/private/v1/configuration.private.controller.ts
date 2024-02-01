import { Request, Response, NextFunction } from 'express';
import { Configuration } from '../../../utils/types/configuration';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { registerSelfDescription } from '../../../libs/loaders/configuration';
import fs from 'fs';
import path from 'path';
import { Logger } from '../../../libs/loggers';

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

        const dirname = path.dirname(
            path.join(__dirname, '..', '..', '..', './keys')
        );

        Logger.info({
            message: `${fs.existsSync(dirname)}`,
        });
        fs.mkdirSync(dirname, { recursive: true });

        if (fs.existsSync(dirname)) {
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
        } else {
            fs.mkdirSync(dirname);

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
        }

        return restfulResponse(res, 200, configuration);
    } catch (err) {
        next(err);
    }
};
