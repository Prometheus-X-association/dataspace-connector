# Routers

When creating a route, please follow the following naming convention:

routerName.public.router.ts - If public
routerName.private.router.ts - If private

This allows the index to automatically pick up the routers and set them up for the express application.