import {getConsentUri, getPDIUri} from "../libs/loaders/configuration";

export const publicCorsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
};

export const privateCorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
};

export const customCorsOptions = {
    origin: getPDIUri(),
    methods: ['GET'],
};
