/**
 * Check if an object is empty.
 */
export const isEmptyObject = (obj: Record<string, any>): boolean =>
    Object.keys(obj).length === 0;

/**
 * Get keys of an object as an array.
 */
export const getObjectKeys = <T>(obj: T): (keyof T)[] =>
    Object.keys(obj) as (keyof T)[];

/**
 * Get values of an object as an array.
 */
export const getObjectValues = <T>(obj: T): T[keyof T][] => Object.values(obj);

/**
 * Merge two objects.
 */
export const mergeObjects = <T, U>(obj1: T, obj2: U): T & U => ({
    ...obj1,
    ...obj2,
});

/**
 * Deep clone an object.
 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
