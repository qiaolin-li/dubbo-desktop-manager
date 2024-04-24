export declare function memoize(_target: any, key: string, descriptor: any): void;
export interface IDebounceReducer<T> {
    (previousValue: T, ...args: any[]): T;
}
export declare function debounce<T>(delay: number, reducer?: IDebounceReducer<T>, initialValueProvider?: () => T): Function;
export declare function throttle<T>(delay: number, reducer?: IDebounceReducer<T>, initialValueProvider?: () => T): Function;
