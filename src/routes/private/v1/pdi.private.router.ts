import { Router } from 'express';
import {
    getAvailableExchanges,
    getUserPrivacyNoticeById,
    getUserPrivacyNotices,
} from '../../../controllers/private/v1/consent.private.controller';
import {customCorsOptions} from "../../../config/cors";
import {pdiMiddleware} from "../../middlewares/pdi.middleware";
import cors from "cors";


const r: Router = Router();

r.get("/exchanges/:as", cors(customCorsOptions), pdiMiddleware, getAvailableExchanges);

// r.get('/:userId/privacy-notices/:privacyNoticeId', cors(customCorsOptions), pdiMiddleware, getUserPrivacyNoticeById);

r.get('/:userId/:providerSd/:consumerSd', cors(customCorsOptions), pdiMiddleware, getUserPrivacyNotices);


export default r;
