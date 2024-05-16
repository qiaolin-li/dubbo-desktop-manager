import { MenuItem } from 'electron';
import { CETMenuItem, IMenuStyle } from './item';
import { IMenuOptions } from './index';
import { MenuBarOptions } from '../../menubar/menubar-options';
import { IMenuIcons } from '../../menubar';
export declare class CETSeparator extends CETMenuItem {
    private separatorElement?;
    constructor(item: MenuItem, submenuIcons: IMenuIcons, submenuParentOptions: MenuBarOptions, submenuOptions: IMenuOptions);
    render(container: HTMLElement): void;
    updateStyle(style: IMenuStyle): void;
}
