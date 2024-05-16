export interface IProcessEnvironment {
    [key: string]: string;
}
export declare const enum Platform {
    Web = 0,
    Mac = 1,
    Linux = 2,
    FreeBSD = 3,
    Windows = 4
}
export declare function PlatformToString(platform: Platform): "Windows" | "Linux" | "FreeBSD" | "Web" | "Mac";
export declare const isWindows: boolean;
export declare const isMacintosh: boolean;
export declare const isLinux: boolean;
export declare const isFreeBSD: boolean;
export declare const isNative: boolean;
export declare const isWeb: boolean;
export declare const platform: Platform;
export declare function isRootUser(): boolean;
export declare const globals: any;
export declare function setImmediate(callback: (...args: any[]) => void): number;
export declare const enum OperatingSystem {
    Windows = 1,
    Macintosh = 2,
    Linux = 3,
    FreeBSD = 4
}
export declare const OS: number;
export declare const enum AccessibilitySupport {
    /**
     * This should be the browser case where it is not known if a screen reader is attached or no.
     */
    Unknown = 0,
    Disabled = 1,
    Enabled = 2
}
