export const handle = (promise: any) => {
    return promise
        .then((data: any) => [data?.data ?? data, undefined])
        .catch((error: any) => {
            throw new Error(error);
        });
};
