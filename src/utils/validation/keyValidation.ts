export const keyValidation = (params: string) => {
    if (params.length !== 100) {
        throw new Error('Wrong key format');
    } else {
        return true;
    }
};
