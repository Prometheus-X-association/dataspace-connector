import templatePublicRouter from "./template.public.router";
import descriptionPublicRouter from "./description.public.router";
import authPublicRouter from "./auth.public.router";

const routers = [
    {
        prefix: '/',
        router: descriptionPublicRouter,
    },
    {
        prefix: '/',
        router: authPublicRouter,
    },
];

export default {
    prefix: '',
    routers,
};
