import { AxiosResponse } from 'axios';

export const handle = (promise: any) => {
    return promise
        .then((data: AxiosResponse) => {
            return [data?.data ?? data, data?.headers];
        })
        .catch((error: any) => {
            throw new Error(error);
        });
};
