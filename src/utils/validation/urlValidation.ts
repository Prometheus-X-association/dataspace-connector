export const urlValidation = (params: string) => {
    if (!/^(https?|http?):\/\/[^\s$.?#].[^\s]*\/$/.exec(params)) {
        throw new Error('URL is not matching');
    } else {
        return true;
    }
};
