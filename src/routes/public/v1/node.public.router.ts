import { Router } from 'express';
import { setupNode, runNode } from '../../../controllers/public/v1/node.public.controller';
const r: Router = Router();

r.post('/setup', setupNode);
r.put('/run', runNode);

export default r;
