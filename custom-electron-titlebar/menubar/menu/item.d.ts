import { MenuItem } from 'electron';
import { Color } from '../../base/common/color';
import { EventLike } from '../../base/common/dom';
import { KeyCode } from '../../base/common/keyCodes';
import { Disposable } from '../../base/common/lifecycle';
import { MenuBarOptions } from '../menubar-options';
import { IMenuOptions } from './index';
import { IMenuIcons } from '../../menubar';
export interface IMenuStyle {
    foregroundColor?: Color;
    backgroundColor?: Color;
    selectionForegroundColor?: Color;
    selectionBackgroundColor?: Color;
    separatorColor?: Color;
    svgColor?: Color;
}
export interface IMenuItem {
    render(element: HTMLElement): void;
    updateStyle(style: IMenuStyle): void;
    onClick(event: EventLike): void;
    dispose(): void;
    isEnabled(): boolean;
    isSeparator(): boolean;
    focus(): void;
    blur(): void;
}
export declare class CETMenuItem extends Disposable implements IMenuItem {
    private _item;
    private menuIcons;
    private parentOptions;
    private options;
    private menuItems?;
    private closeSubMenu;
    private _mnemonic?;
    private _currentElement?;
    private labelElement?;
    private iconElement?;
    protected itemElement?: HTMLElement;
    protected menuStyle?: IMenuStyle;
    private radioGroup?;
    constructor(_item: MenuItem, menuIcons: IMenuIcons, parentOptions: MenuBarOptions, options: IMenuOptions, menuItems?: IMenuItem[] | undefined, closeSubMenu?: () => void);
    render(el: HTMLElement): void;
    onClick(event: EventLike): void;
    protected applyStyle(): void;
    updateStyle(style: IMenuStyle): void;
    focus(): void;
    blur(): void;
    setAccelerator(): void;
    updateLabel(): void;
    updateIcon(): void;
    updateTooltip(): void;
    updateEnabled(): void;
    updateVisibility(): void;
    updateChecked(): void;
    updateRadioGroup(): void;
    /** radioGroup index's starts with (previous separator +1 OR menuItems[0]) and ends with (next separator OR menuItems[length]) */
    getRadioGroup(): {
        start: number;
        end: number;
    };
    get element(): HTMLElement | undefined;
    get item(): MenuItem;
    isEnabled(): boolean;
    isSeparator(): boolean;
    get mnemonic(): KeyCode | undefined;
    dispose(): void;
}
