import { Router } from 'express';
import { webhookUserIdentifier } from '../../../controllers/private/v1/webhook.controller';

const r: Router = Router();

/**
 * Receives the userIdentifier from the consent-manager after the guardian has
 * validated the guardianship request. No JWT auth — secured by X-Webhook-Secret header.
 */
r.post('/user-identifier', webhookUserIdentifier);

export default r;
