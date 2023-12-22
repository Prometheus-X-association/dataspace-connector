/**
 * Parse JSON string safely, handling errors.
 */
export const safeJsonParse = <T>(jsonString: string): T | null => {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return null;
    }
};

/**
 * Stringify an object to JSON safely, handling errors.
 */
export const safeJsonStringify = (obj: any): string | null => {
    try {
        return JSON.stringify(obj);
    } catch (error) {
        return null;
    }
};

/**
 * Pretty-print JSON string with indentation.
 */
export const prettyPrintJson = (jsonString: string): string | null => {
    const parsedJson = safeJsonParse(jsonString);
    if (parsedJson !== null) {
        return JSON.stringify(parsedJson, null, 2);
    }
    return null;
};

/**
 * Merge two JSON objects.
 */
export const mergeJsonObjects = (
    json1: string,
    json2: string
): string | null => {
    const parsedJson1 = safeJsonParse<object>(json1);
    const parsedJson2 = safeJsonParse<object>(json2);

    if (parsedJson1 !== null && parsedJson2 !== null) {
        const merged = { ...parsedJson1, ...parsedJson2 };
        return safeJsonStringify(merged);
    }

    return null;
};

/**
 * Validate if a string is a valid JSON format.
 */
export const isValidJson = (jsonString: string): boolean => {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (error) {
        return false;
    }
};
