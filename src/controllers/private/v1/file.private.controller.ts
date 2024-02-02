import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { errorRes } from '../../../libs/api/APIResponse';
import fs from 'fs';
import path from 'path';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import { getEndpoint } from '../../../libs/loaders/configuration';
import { urlChecker } from '../../../utils/urlChecker';

/**
 * upload a file
 * not used
 */
export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { file, checksum, fileName } = req.body;

        const binaryData = Buffer.from(file, 'base64');
        const hash = crypto.createHash('sha256');
        hash.update(binaryData);
        const checksumVerification = hash.digest('hex');

        if (checksumVerification !== checksum) {
            return errorRes({
                req,
                res,
                code: 404,
                errorMsg: 'File Verification error',
                message: 'File is corrupted',
            });
        }
        const directory = path.join(__dirname, '..', '..', '..', '/public/');

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            fs.writeFileSync(
                path.join(__dirname, '..', '..', '..', '/public/' + fileName),
                binaryData
            );
        } else {
            fs.writeFileSync(
                path.join(__dirname, '..', '..', '..', '/public/' + fileName),
                binaryData
            );
        }
        return restfulResponse(res, 200, {
            path: urlChecker(await getEndpoint(), `static/${fileName}`),
        });
    } catch (err) {
        next(err);
    }
};
