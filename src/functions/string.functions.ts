/**
 * Trims whitespace from both ends of a string.
 */
export const trim = (str: string): string => str.trim();

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Converts a string to camelCase.
 */
export const toCamelCase = (str: string): string =>
    str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

/**
 * Converts a string to snake_case.
 */
export const toSnakeCase = (str: string): string =>
    str
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('_');

/**
 * Reverses a string.
 */
export const reverse = (str: string): string =>
    str.split('').reverse().join('');

/**
 * Checks if a string is a palindrome.
 */
export const isPalindrome = (str: string): boolean => {
    const cleanStr = str.replace(/\W/g, '').toLowerCase();
    return cleanStr === reverse(cleanStr);
};

/**
 * Replaces all line breaks in a string with HTML <br> tags.
 */
export const nl2br = (str: string): string => str.replace(/\n/g, '<br>');

/**
 * Escapes a string for insertion into HTML.
 */
export const escapeHtml = (str: string): string =>
    str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

/**
 * Unescapes HTML special characters to their equivalent characters.
 */
export const unescapeHtml = (str: string): string =>
    str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, '&');

/**
 * Generates a random string of a given length using alphanumeric characters.
 */
export const randomString = (length: number): string => {
    const chars =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
};

/**
 * Checks if a string is empty, null, or just whitespace.
 */
export const isEmptyOrWhitespace = (str: string | null | undefined): boolean =>
    str == null || str.trim() === '';

/**
 * Converts a string to kebab-case.
 */
export const toKebabCase = (str: string): string =>
    str
        .replace(/\W+/g, '-')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('-');
