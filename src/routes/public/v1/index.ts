import templatePublicRouter from "./template.public.router";
import descriptionPublicRouter from "./description.public.router";
import authPublicRouter from "./auth.public.router";
import consentPublicRouter from "./consent.public.router";
import dataPublicRouter from "./data.public.router";

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
];

export default {
    prefix: '',
    routers,
};
