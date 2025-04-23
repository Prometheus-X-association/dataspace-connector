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

r.post('/node/setup', setupNode);
r.post('/node/run', runNode);
r.post('/node/pause', pauseNode);
r.post('/resume', resumeNode);
r.post('/node/notify', notify);
r.post('/node/pre', preProcess);

export default r;
