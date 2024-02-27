import { Params } from './PolicyFetcher';

export const replaceUrlParams = (url: string, params: Params): string => {
    const matches = url.match(/@{([^}]+)}/g);
    if (matches) {
        for (const match of matches) {
            const paramName = match.substring(2, match.length - 1);
            const paramValue = String(params[paramName]);
            url = url.replace(match, paramValue);
        }
    }
    return url;
};
