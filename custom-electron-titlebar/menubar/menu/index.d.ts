import { MenuItem } from 'electron';
import { Disposable } from '../../base/common/lifecycle';
import { IMenuStyle } from './item';
import { Event } from '../../base/common/event';
import { MenuBarOptions } from '../menubar-options';
import { ISubMenuData } from './submenu';
import { IMenuIcons } from '../../menubar';
export declare enum Direction {
    Right = 0,
    Left = 1
}
export interface IMenuOptions {
    ariaLabel?: string;
    enableMnemonics?: boolean;
}
export declare class CETMenu extends Disposable {
    private menuContainer;
    private menuIcons;
    private parentOptions;
    private currentOptions;
    private closeSubMenu;
    private focusedItem?;
    private items;
    private mnemonics;
    private triggerKeys;
    parentData: ISubMenuData;
    private _onDidCancel;
    constructor(menuContainer: HTMLElement, menuIcons: IMenuIcons, parentOptions: MenuBarOptions, currentOptions: IMenuOptions, closeSubMenu?: () => void);
    trigger(index: number): void;
    createMenu(menuItems: MenuItem[] | undefined): void;
    private isTriggerKeyEvent;
    private updateFocusedItem;
    focus(index?: number): void;
    focus(selectFirst?: boolean): void;
    private focusNext;
    private focusPrevious;
    private updateFocus;
    private doTrigger;
    private cancel;
    private focusItemByElement;
    private setFocusedItem;
    applyStyle(style: IMenuStyle): void;
    get container(): HTMLElement;
    get onDidCancel(): Event<void>;
    dispose(): void;
}
