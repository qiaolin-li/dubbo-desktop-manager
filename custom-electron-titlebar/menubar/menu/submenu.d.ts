import { MenuItem } from 'electron';
import { CETMenuItem } from './item';
import { EventLike } from '../../base/common/dom';
import { CETMenu, IMenuOptions } from './index';
import { MenuBarOptions } from '../../menubar/menubar-options';
import { IMenuIcons } from '../../menubar';
export interface ISubMenuData {
    parent: CETMenu;
    submenu?: CETMenu;
}
export declare class CETSubMenu extends CETMenuItem {
    private submenuIcons;
    private submenuItems;
    private parentData;
    private submenuParentOptions;
    private submenuOptions;
    private mySubmenu?;
    private submenuContainer?;
    private submenuIndicator?;
    private submenuDisposables;
    private mouseOver;
    private showScheduler;
    private hideScheduler;
    private _closeSubMenu;
    constructor(item: MenuItem, submenuIcons: IMenuIcons, submenuItems: MenuItem[], parentData: ISubMenuData, submenuParentOptions: MenuBarOptions, submenuOptions: IMenuOptions, closeSubMenu?: () => void);
    render(el: HTMLElement): void;
    private cleanupExistingSubmenu;
    private createSubmenu;
    protected applyStyle(): void;
    onClick(e: EventLike): void;
    dispose(): void;
}
