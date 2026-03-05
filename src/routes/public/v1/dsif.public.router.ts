import { Router } from 'express';
import {
    DsifNegotiationAgreement,
    DsifNegotiationTermination,
    DsifNegotiationEvents,
} from '../../../controllers/public/v1/dsif.public.controller';

const r: Router = Router();

r.post('/negotiations/:consumerPid/agreement', DsifNegotiationAgreement);
r.post('/negotiations/:consumerPid/events', DsifNegotiationEvents);
r.post('/negotiations/:consumerPid/termination', DsifNegotiationTermination);

export default r;
