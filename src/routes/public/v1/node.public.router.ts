import { Router } from 'express';
import {
    setupNode,
    runNode,
    notify,
} from '../../../controllers/public/v1/node.public.controller';
const r: Router = Router();

r.post('/communicate/setup', setupNode);
r.post('/communicate/run', runNode);
r.post('/communicate/notify', notify);

export default r;
