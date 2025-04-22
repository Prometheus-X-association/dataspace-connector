import { Request, Response, NextFunction } from 'express';
import { restfulResponse } from '../../../libs/api/RESTfulResponse';
import {
    createInfrastructureConfigurationService,
    deleteInfrastructureConfigurationService,
    getInfrastructureConfigurationByIdService,
    getInfrastructureConfigurationsService,
    updateInfrastructureConfigurationService,
} from '../../../services/private/v1/infrastructure.configuration.private.service';

/**
 * get all the infrastructure configurations
 * @param req
 * @param res
 * @param next
 */
export const getInfrastructureConfigurations = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const infrastructureConfigurations =
            await getInfrastructureConfigurationsService();

        return restfulResponse(res, 200, infrastructureConfigurations);
    } catch (err) {
        next(err);
    }
};

/**
 * get a infrastructure configuration by id
 * @param req
 * @param res
 * @param next
 */
export const getInfrastructureConfigurationById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const infrastructureConfiguration =
            await getInfrastructureConfigurationByIdService(req.params.id);

        if (!infrastructureConfiguration) {
            return restfulResponse(res, 404, {
                error: 'Infrastructure Configuration not found',
            });
        }

        return restfulResponse(res, 200, infrastructureConfiguration);
    } catch (err) {
        next(err);
    }
};

/**
 * create a infrastructure configuration
 * @param req
 * @param res
 * @param next
 */
export const createInfrastructureConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { verb, data, service, resource } = req.body;

        const infrastructureConfiguration =
            await createInfrastructureConfigurationService({
                verb,
                data,
                service,
                resource,
            });

        return restfulResponse(res, 201, infrastructureConfiguration);
    } catch (err) {
        next(err);
    }
};

/**
 * update a infrastructure configuration
 * @param req
 * @param res
 * @param next
 */
export const updateInfrastructureConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const infrastructureConfiguration =
            await updateInfrastructureConfigurationService(req.params.id, {
                ...req.body,
            });

        if (!infrastructureConfiguration) {
            return restfulResponse(res, 404, {
                error: 'Infrastructure Configuration not found',
            });
        }

        return restfulResponse(res, 200, infrastructureConfiguration);
    } catch (err) {
        next(err);
    }
};

/**
 * delete a infrastructure configuration
 * @param req
 * @param res
 * @param next
 */
export const deleteInfrastructureConfiguration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const infrastructureConfiguration =
            await deleteInfrastructureConfigurationService(req.params.id);

        if (!infrastructureConfiguration) {
            return restfulResponse(res, 404, {
                error: 'Infrastructure Configuration not found',
            });
        }

        return restfulResponse(res, 200, infrastructureConfiguration);
    } catch (err) {
        next(err);
    }
};
