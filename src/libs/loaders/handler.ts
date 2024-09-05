import { Logger } from '../loggers';

export const handle = (promise: any) => {
    return promise
        .then((data: any) => [data?.data ?? data, undefined])
        .catch((error: any) => {
            Logger.error({
                message: error.message,
                location: error.stack,
            });
        });
};
