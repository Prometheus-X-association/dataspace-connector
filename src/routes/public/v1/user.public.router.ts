import r from './auth.public.router';
import { excelExport } from '../../../controllers/private/v1/user.private.controller';

/**
 * @swagger
 * /users/template:
 *   post:
 *     summary: Get the default csv file
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: Successful response
 */
r.post('/template', excelExport);

export default r;
