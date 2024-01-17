export const urlValidation = (params: string) => {
    if (!params.match('^(https?|http?):\\/\\/[^\\s$.?#].[^\\s]*\\/$')) {
        throw new Error('URL is not matching');
    } else {
        return true;
    }
};
