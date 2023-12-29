export const replaceUrlParams = (
    url: string,
    params: Record<string, string>
): string => {
    const matches = url.match(/@{([^}]+)}/g);
    if (matches) {
        for (const match of matches) {
            const paramName = match.substring(2, match.length - 1);
            const paramValue = params[paramName];
            url = url.replace(match, paramValue || "");
        }
    }
    return url;
};
