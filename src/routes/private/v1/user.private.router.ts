import { Router } from 'express';
import {
    createUser, createUserFromConsent, createUserToApp,
    deleteUser,
    excelExport,
    excelImport,
    getUserById,
    getUsers,
    updateUser,
} from '../../../controllers/private/v1/user.private.controller';
import { upload } from '../../../libs/loaders/multer';
import { auth } from '../../middlewares/auth.middleware';
const r: Router = Router();

r.use(auth);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Catalogs of a data space connector
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         internalID:
 *           type: string
 *           description: your internal id inside your app / database for the user.
 *         email:
 *           type: string
 *           description: email of the user in your app / database.
 *         userIdentifier:
 *           type: string
 *           description: identifier provided by the consent.
 */

/**
 * @swagger
 * /private/users:
 *   post:
 *     summary: Create a user
 *     tags: [Users]
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
 *             email:
 *               description: User email
 *               type: string
 *             internalID:
 *               description: User internal id
 *               type: string
 *             url:
 *               description: url
 *               type: string
 *               required: false
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/', createUser);

/**
 * @swagger
 * /private/users/:
 *   get:
 *     summary: Get Users
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/', getUsers);

/**
 * @swagger
 * /private/users/{id}:
 *   get:
 *     summary: Get a user by id
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: user id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.get('/:id', getUserById);

/**
 * @swagger
 * /private/users/{id}:
 *   put:
 *     summary: Update a user by id
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: user id.
 *          in: path
 *          required: true
 *          type: string
 *     requestBody:
 *      content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               description: User email
 *               type: string
 *             internalID:
 *               description: user id from your system
 *               type: string
 *             url:
 *               description: url
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put('/:id', updateUser);

/**
 * @swagger
 * /private/users/{id}:
 *   delete:
 *     summary: Delete a user by id
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     parameters:
 *        - name: id
 *          description: user id.
 *          in: path
 *          required: true
 *          type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.delete('/:id', deleteUser);

/**
 * @swagger
 * /private/users/import:
 *   post:
 *     summary: Import users with a csv file
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     security:
 *       - jwt: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: base64
 *       '200':
 *         description: Successful response
 *       '400':
 *         description: Error response
 */
r.post('/import', upload.single('file'), excelImport);

/**
 * @swagger
 * /private/users/register:
 *   post:
 *     summary: Create a user from the consent
 *     tags: [Users]
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
 *             email:
 *               description: User email
 *               type: string
 *             internalID:
 *               description: User internal id
 *               type: string
 *             userIdentifier:
 *               description: User identifier from consent
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/register', createUserFromConsent);

/**
 * @swagger
 * /private/users/app:
 *   post:
 *     summary: Create a user from the consent to the participant app
 *     tags: [Users]
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
 *             email:
 *               description: User email
 *               type: string
 *             consentID:
 *               description: Consent Id
 *               type: string
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/app', createUserToApp);

export default r;
