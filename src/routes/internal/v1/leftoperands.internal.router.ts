import { Router } from 'express';
import { getCount } from '../../../controllers/internal/v1/leftoperands.internal.controller';
const r: Router = Router();

r.get('/count/:contractId/:resourceId', getCount);

export default r;
