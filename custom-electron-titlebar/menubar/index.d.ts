import { Menu } from 'electron';
import { Event } from '../base/common/event';
import { Disposable } from '../base/common/lifecycle';
import { MenuBarOptions } from './menubar-options';
import { Direction } from './menu';
import { IMenuStyle } from './menu/item';
export interface IMenuIcons {
    readonly submenuIndicator: string;
    readonly checkbox: string;
    readonly radioChecked: string;
    readonly radioUnchecked: string;
}
export interface IMenuBarOptions {
    enableMnemonics?: boolean;
    disableAltFocus?: boolean;
    visibility?: string;
    alwaysOnMnemonics?: boolean;
    compactMode?: Direction;
}
export interface MenuBarMenu {
    actions?: Menu;
    label: string;
}
export declare class MenuBar extends Disposable {
    private container;
    private menuIcons;
    private currentOptions;
    private options;
    private closeMenu;
    static readonly OVERFLOW_INDEX: number;
    private menus;
    private overflowMenu;
    private focusedMenu;
    private focusToReturn;
    private menuUpdater;
    private _mnemonicsInUse;
    private openedViaKeyboard;
    private awaitingAltRelease;
    private ignoreNextMouseUp;
    private mnemonics;
    private updatePending;
    private _focusState;
    private readonly _onVisibilityChange;
    private readonly _onFocusStateChange;
    private numMenusShown;
    private overflowLayoutScheduled;
    private menuStyle;
    constructor(container: HTMLElement, menuIcons: IMenuIcons, currentOptions: MenuBarOptions, options: IMenuBarOptions, closeMenu?: () => void);
    private registerListeners;
    push(menu: Menu): void;
    createOverflowMenu(): void;
    setStyles(style: IMenuStyle): void;
    updateMenu(menu: MenuBarMenu): void;
    dispose(): void;
    blur(): void;
    getWidth(): number;
    getHeight(): number;
    toggleFocus(): void;
    private updateOverflowAction;
    private updateLabels;
    update(options?: IMenuBarOptions): void;
    private registerMnemonic;
    private hideMenubar;
    private showMenubar;
    private get focusState();
    private set focusState(value);
    get isVisible(): boolean;
    private get isFocused();
    private get isOpen();
    private get hasOverflow();
    private get isCompact();
    private setUnfocusedState;
    private focusPrevious;
    private focusNext;
    private updateMnemonicVisibility;
    private get mnemonicsInUse();
    private set mnemonicsInUse(value);
    private get shouldAltKeyFocus();
    get onVisibilityChange(): Event<boolean>;
    get onFocusStateChange(): Event<boolean>;
    private onMenuTriggered;
    private onModifierKeyToggled;
    private isCurrentMenu;
    private cleanupMenu;
    private showMenu;
}
