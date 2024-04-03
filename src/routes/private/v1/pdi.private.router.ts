import { Router } from 'express';
import { auth } from '../../middlewares/auth.middleware';
import {
    getAvailableExchanges,
    getUserPrivacyNoticeById,
    giveConsent,
} from '../../../controllers/private/v1/consent.private.controller';
import {customCorsOptions} from "../../../config/cors";
import {pdiMiddleware} from "../../middlewares/pdi.middleware";
import cors from "cors";


const r: Router = Router();

r.get("/exchanges/:as", cors(customCorsOptions), pdiMiddleware, getAvailableExchanges);

r.get('/:userId/privacy-notices/:privacyNoticeId', cors(customCorsOptions), pdiMiddleware, getUserPrivacyNoticeById);


export default r;
