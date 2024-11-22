import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import { body, check } from 'express-validator';
import {
    createInfrastructureConfiguration,
    deleteInfrastructureConfiguration,
    getInfrastructureConfigurationById,
    getInfrastructureConfigurations,
    updateInfrastructureConfiguration,
} from '../../../controllers/private/v1/infrastructure.configuration.private.controller';
const r: Router = Router();

r.use(auth);

/**
 * @swagger
 * tags:
 *   name: Infrastructure Configurations
 *   description: Infrastructure Configurations routes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InfrastructureConfiguration:
 *       type: object
 *       properties:
 *         verb:
 *           type: string
 *           description: the verb of the infrastructure configuration.
 *         data:
 *           type: string
 *           description: the data of the infrastructure configuration.
 *         infrastructureService:
 *           type: string
 *           description: the infrastructure service of the infrastructure configuration.
 */

/**
 * @swagger
 * /private/infrastructure/configurations/{id}:
 *   put:
 *     summary: update infrastructure configurations
 *     tags: [Infrastructure Configurations]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: credential id.
 *          in: path
 *          required: true
 *          type: string
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             verb:
 *               description: the verb of the infrastructure configuration.
 *               type: string
 *               example: GET
 *             data:
 *               description: which data is needed
 *               type: string
 *             infrastructureService:
 *               description: the infrastructure service url.
 *               type: string
 *             resource:
 *               description: target resource url.
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put(
    '/:id',
    [
        check('id').isString(),
        body('verb').optional().isString(),
        body('data').optional().isBoolean(),
        body('infrastructureService').optional().isString(),
        body('resource').optional().isString(),
    ],
    updateInfrastructureConfiguration
);

/**
 * @swagger
 * /private/infrastructure/configurations:
 *   get:
 *     summary: get infrastructure configurations
 *     tags: [Infrastructure Configurations]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/', getInfrastructureConfigurations);

/**
 * @swagger
 * /private/infrastructure/configurations/{id}:
 *   get:
 *     summary: get infrastructure configuration by id
 *     tags: [Infrastructure Configurations]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: infrastructure configuration id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:id', [check('id').isString()], getInfrastructureConfigurationById);

/**
 * @swagger
 * /private/infrastructure/configurations:
 *   post:
 *     summary: create infrastructure configurations
 *     tags: [Infrastructure Configurations]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             verb:
 *               description: the verb of the infrastructure configuration.
 *               type: string
 *               example: GET contract
 *             data:
 *               description: which data is needed
 *               type: string
 *             infrastructureService:
 *               description: the infrastructure service of the infrastructure configuration.
 *               type: string
 *             resource:
 *               description: the target resource url.
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post(
    '/',
    [
        body('verb').exists().isString(),
        body('data').exists().isString(),
        body('infrastructureService').exists().isString(),
        body('resource').exists().isString(),
    ],
    createInfrastructureConfiguration
);

/**
 * @swagger
 * /private/infrastructure/configurations/{id}:
 *   delete:
 *     summary: delete infrastructure configuration by id
 *     tags: [Infrastructure Configurations]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: infrastructure configuration id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.delete('/:id', [check('id').isString()], deleteInfrastructureConfiguration);

export default r;
