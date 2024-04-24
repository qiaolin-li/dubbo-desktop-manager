import { Color } from './base/common/color';
import { IMenuIcons } from './menubar';
export declare const INACTIVE_FOREGROUND_DARK: Color;
export declare const ACTIVE_FOREGROUND_DARK: Color;
export declare const INACTIVE_FOREGROUND: Color;
export declare const ACTIVE_FOREGROUND: Color;
export declare const DEFAULT_ITEM_SELECTOR: Color;
export declare const IS_MAC_BIGSUR_OR_LATER: boolean;
export declare const BOTTOM_TITLEBAR_HEIGHT = 60;
export declare const TOP_TITLEBAR_HEIGHT_MAC: number;
export declare const TOP_TITLEBAR_HEIGHT_WIN = 30;
export declare const WINDOW_MIN_WIDTH = 400;
export declare const WINDOW_MIN_HEIGHT = 270;
export declare const MENU_MNEMONIC_REGEX: RegExp;
export declare const MENU_ESCAPED_MNEMONIC_REGEX: RegExp;
interface ITitlebarIcons extends IMenuIcons {
    linux: {
        minimize: string;
        maximize: string;
        restore: string;
        close: string;
    };
    freebsd: {
        minimize: string;
        maximize: string;
        restore: string;
        close: string;
    };
    windows: {
        minimize: string;
        maximize: string;
        restore: string;
        close: string;
    };
}
export declare const menuIcons: ITitlebarIcons;
export declare function getPx(value: number): string;
/**
 * Handles mnemonics for menu items. Depending on OS:
 * - Windows: Supported via & character (replace && with &)
 * - Linux: Supported via & character (replace && with &)
 * - FreeBSD: Supported via & character (replace && with &)
 * - macOS: Unsupported (replace && with empty string)
 */
export declare function mnemonicMenuLabel(label: string, forceDisableMnemonics?: boolean): string;
/**
 * Handles mnemonics for buttons. Depending on OS:
 * - Windows: Supported via & character (replace && with & and & with && for escaping)
 * - Linux: Supported via _ character (replace && with _)
 * - FreeBSD: Supported via _ character (replace && with _)
 * - macOS: Unsupported (replace && with empty string)
 */
export declare function mnemonicButtonLabel(label: string, forceDisableMnemonics?: boolean): string;
export declare function cleanMnemonic(label: string): string;
export declare function parseAccelerator(accelerator: Electron.Accelerator | string): string;
export declare function applyFill(element: HTMLElement | undefined | null, svgColor: Color | undefined, fgColor: Color | undefined, color?: boolean): void;
export declare function loadWindowIcons(icons: string | undefined): any;
export {};
