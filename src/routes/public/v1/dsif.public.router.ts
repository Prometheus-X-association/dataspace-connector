import { Router } from 'express';
import {
    DsifNegotiationAgreement,
    DsifNegotiationTermination,
    DsifNegotiationEvents,
    DsifNegotiationRequest,
    DsifNegotiationAgreementVerification,
    DsifProviderNegotiationEvents,
    DsifProviderNegotiationTermination,
} from '../../../controllers/public/v1/dsif.public.controller';

const r: Router = Router();

// Consumer Path Bindings
r.post('/negotiations/:consumerPid/agreement', DsifNegotiationAgreement);
r.post('/negotiations/:consumerPid/events', DsifNegotiationEvents);
r.post('/negotiations/:consumerPid/termination', DsifNegotiationTermination);

// Provider Path Bindings
r.post('/negotiations/:providerPid/request', DsifNegotiationRequest);
r.post('/negotiations/:providerPid/events', DsifProviderNegotiationEvents);
r.post(
    '/negotiations/:providerPid/agreement/verification',
    DsifNegotiationAgreementVerification
);
r.post(
    '/negotiations/:providerPid/termination',
    DsifProviderNegotiationTermination
);

export default r;
