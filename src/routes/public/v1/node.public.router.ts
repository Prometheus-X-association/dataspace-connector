import { Router } from 'express';
import {
    setupNode,
    runNode,
    notify,
    pauseNode,
    resumeNode,
    preProcess,
} from '../../../controllers/public/v1/node.public.controller';
const r: Router = Router();

r.post('/communicate/setup', setupNode);
r.post('/communicate/run', runNode);
r.post('/communicate/pause', pauseNode);
r.post('/communicate/resume', resumeNode);
r.post('/communicate/notify', notify);
r.post('/communicate/pre', preProcess);

export default r;
