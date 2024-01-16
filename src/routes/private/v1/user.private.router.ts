import { Router } from "express";
import {
    createUser,
    deleteUser,
    excelExport,
    excelImport,
    getUserById,
    getUsers,
    updateUser,
} from "../../../controllers/private/v1/user.private.controller";
import { upload } from "../../../libs/loaders/multer";
const r: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Catalogs of a data space connector
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
 *               type: boolean
 *             userId:
 *               description: User internal id
 *               type: boolean
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post("/", createUser);

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
r.get("/", getUsers);

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
r.get("/:id", getUserById);

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
 *               type: boolean
 *             userId:
 *               description: User internal id
 *               type: boolean
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.put("/:id", updateUser);

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
r.delete("/:id", deleteUser);

/**
 * @swagger
 * /private/users/export:
 *   post:
 *     summary: Get the default csv file
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post("/export", excelExport);

/**
 * @swagger
 * /private/users/import:
 *   post:
 *     summary: Import users with a csv file
 *     tags: [Users]
 *     produces:
 *       - application/json
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
r.post("/import", upload.single("file"), excelImport);

export default r;
