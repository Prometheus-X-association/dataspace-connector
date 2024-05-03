import { getModalOrigins } from '../libs/loaders/configuration';
import cors from 'cors';

export const publicCorsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
};

export const privateCorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
};

export const customCorsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        getModalOrigins()
            .then((modalOrigins) => {
                const origins = modalOrigins.map((element) => element.origin);

                if (!origin) {
                    callback(new Error('Missing origin'));
                } else if (origin && origins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            })
            .catch((error) => {
                callback(error);
            });
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
