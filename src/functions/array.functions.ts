/**
 * Check if an array is empty.
 */
export const isEmptyArray = (arr: any[]): boolean => arr.length === 0;

/**
 * Get the unique elements from an array.
 */
export const uniqueElements = <T>(arr: T[]): T[] => [...new Set(arr)];

/**
 * Check if all elements in the array satisfy a condition.
 */
export const all = <T>(arr: T[], condition: (element: T) => boolean): boolean =>
    arr.every(condition);

/**
 * Check if any element in the array satisfies a condition.
 */
export const any = <T>(arr: T[], condition: (element: T) => boolean): boolean =>
    arr.some(condition);

/**
 * Remove duplicates from an array.
 */
export const removeDuplicates = <T>(arr: T[]): T[] => [...new Set(arr)];

/**
 * Filter out null or undefined values from an array.
 */
export const filterNonNull = <T>(arr: (T | null | undefined)[]): T[] =>
    arr.filter(
        (element): element is T => element !== null && element !== undefined
    );

/**
 * Chunk an array into smaller arrays of a specified size.
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
        arr.slice(index * size, index * size + size)
    );
