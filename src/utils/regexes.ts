export const Regexes = {
    /**
     * Allows only letters, numbers, underscores and hashes
     */
    noSpecialChars: /^([A-Za-z\-\\_\d])+$/,

    /**
     * Validates a proper email address format.
     */
    email: /^([a-z0-9_.+-]+)@([a-z0-9-]+\.)+[a-z0-9]{2,4}$/i,

    /**
     * Checks for a valid URL (http, https, ftp).
     */
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,

    /**
     * Matches a date in the format YYYY-MM-DD.
     */
    dateISO: /^\d{4}-\d{2}-\d{2}$/,

    /**
     * Matches a hexadecimal color code.
     */
    hexColor: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i,

    /**
     * Matches a positive or negative integer.
     */
    integer: /^-?\d+$/,

    /**
     * Matches a positive or negative decimal number.
     */
    decimalNumber: /^-?\d+(\.\d+)?$/,

    /**
     * Matches a strong password with at least 8 characters,
     * one uppercase letter, one lowercase letter, one number, and one special character.
     */
    strongPassword:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

    /**
     * Matches a simple alphanumeric password of 6 to 20 characters
     * which contain at least one numeric digit.
     */
    simplePassword: /^(?=.*\d)[A-Za-z\d]{6,20}$/,

    /**
     * Matches a string between {}
     */
    params: /{([^}]*)}/g,

    /**
     * Matches a string between {}
     */
    userIdParams: /\{userId\}/g,

    /**
     * Matches a string between {}
     */
    urlParams: /\{url\}/g,

    /**
     * Matches a string with http, https, ftp
     */
    http: /^(?:https?|ftp)/g,
};
