export const handle = (promise: any) => {
    return promise
        .then((data: any) => [data?.data ?? data, undefined])
        .catch((error: any) => Promise.resolve([undefined, error]));
};
