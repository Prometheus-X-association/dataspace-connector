import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import {
    createCredentialService,
    getCredentialByIdService,
    getCredentialsServices,
    updateCredentialService,
} from '../../../services/private/v1/credential.private.service';

/**
 * get all the credentials
 * @param req
 * @param res
 * @param next
 * @return restfulResponse
 */
export const getCredentials = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const credential = await getCredentialsServices();

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
 * @return restfulResponse
 */
export const getCredentialById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const credential = await getCredentialByIdService(id);

        if (!credential) {
            return restfulResponse(res, 404, {
                error: 'Credential not found',
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
 * @return restfulResponse
 */
export const createCredential = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { type, key, value, content } = req.body;

        const credential = await createCredentialService({
            type,
            key,
            value,
            content
        });

        if (!credential) {
            return restfulResponse(res, 400, {
                error: 'Error when creating the credential',
            });
        }

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
 * @return restfulResponse
 */
export const updateCredential = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { type, key, value } = req.body;

        const credential = await updateCredentialService({
            id,
            type,
            key,
            value,
        });

        if (!credential) {
            return restfulResponse(res, 404, {
                error: 'Credential not found',
            });
        }

        return restfulResponse(res, 200, credential);
    } catch (err) {
        next(err);
    }
};
