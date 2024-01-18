import descriptionPublicRouter from './description.public.router';
import authPublicRouter from './auth.public.router';
import consentPublicRouter from './consent.public.router';
import dataPublicRouter from './data.public.router';
import providerPublicRouter from './provider.public.router';
import dataExchangePublicRouter from './dataExchange.public.router';

const routers = [
    {
        prefix: '/',
        router: descriptionPublicRouter,
    },
    {
        prefix: '/',
        router: authPublicRouter,
    },
    {
        prefix: '/consent',
        router: consentPublicRouter,
    },
    {
        prefix: '/data',
        router: dataPublicRouter,
    },
    {
        prefix: '/provider',
        router: providerPublicRouter,
    },
    {
        prefix: '/consumer',
        router: consentPublicRouter,
    },
    {
        prefix: '/dataexchanges',
        router: dataExchangePublicRouter,
    },
];

export default {
    prefix: '',
    routers,
};
