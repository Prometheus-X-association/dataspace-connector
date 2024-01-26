import { Router } from 'express';
import { privateTemplateMethod } from '../../../controllers/private/v1/template.private.controller';
const r: Router = Router();

r.get('/', privateTemplateMethod);

export default r;
