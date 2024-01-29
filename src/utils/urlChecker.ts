export const urlChecker = (endpoint: string, route: string) => {
    if (endpoint.endsWith('/')) {
        return `${endpoint}${route}`;
    } else {
        return `${endpoint}/${route}`;
    }
};
