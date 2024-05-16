/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */
export declare function tail<T>(array: ArrayLike<T>, n?: number): T;
/**
 * @returns a new array with all falsy values removed. The original array IS NOT modified.
 */
export declare function coalesce<T>(array: Array<T | undefined | null>): T[];
