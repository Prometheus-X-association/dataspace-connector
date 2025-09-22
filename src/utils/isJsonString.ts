export const isJsonString = (string: string) => {
    try {
        JSON.parse(string);
        return true;
    } catch (e) {
        return false;
    }
};
