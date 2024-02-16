import { internalAuth } from '../../middlewares/internal.auth.middleware';
import leftOperandInternatRouter from './leftoperands.internal.router';

const routers = [
    {
        prefix: '/leftoperands',
        router: leftOperandInternatRouter,
    },
];
export default {
    prefix: '/internal',
    routers,
    middleware: internalAuth,
};
