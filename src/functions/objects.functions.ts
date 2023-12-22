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
 * Pick selected properties from an object.
 */
export const pickProperties = <T, K extends keyof T>(
    obj: T,
    props: K[]
): Pick<T, K> => {
    const picked: Partial<T> = {};
    props.forEach((prop) => {
        if (
            Object.prototype.hasOwnProperty.call(obj, prop as string | symbol)
        ) {
            picked[prop] = obj[prop];
        }
    });
    return picked as Pick<T, K>;
};

/**
 * Omit selected properties from an object.
 */
export const omitProperties = <T, K extends keyof T>(
    obj: T,
    props: K[]
): Omit<T, K> => {
    const omitted: Partial<T> = { ...obj };
    props.forEach((prop) => {
        if (
            Object.prototype.hasOwnProperty.call(obj, prop as string | symbol)
        ) {
            delete omitted[prop];
        }
    });
    return omitted as Omit<T, K>;
};

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

/**
 * Map over values of an object.
 */
export const mapObjectValues = <T, U>(
    obj: T,
    mapper: (value: T[keyof T]) => U
): Record<string, U> => {
    const result: Record<string, U> = {};
    (Object.keys(obj) as Array<keyof T>).forEach((key) => {
        const mappedValue = mapper(obj[key]);
        result[key as string] = mappedValue;
    });
    return result;
};
