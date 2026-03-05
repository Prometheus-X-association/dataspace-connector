import { Router } from 'express';
import { DsifNegotiation } from '../../../controllers/private/v1/dsif.private.controller';

const r: Router = Router();

r.post('/', DsifNegotiation);

export default r;
