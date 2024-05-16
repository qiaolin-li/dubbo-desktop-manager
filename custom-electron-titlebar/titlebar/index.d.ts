import { Color } from '../base/common/color';
import { MenuBar } from '../menubar';
import { TitleBarOptions } from './options';
import { ThemeBar } from './themebar';
export declare class CustomTitlebar extends ThemeBar {
    private titlebar;
    private dragRegion;
    private icon;
    private menuBarContainer;
    private title;
    private controlsContainer;
    private container;
    private menuBar?;
    private isInactive;
    private controls;
    private resizer;
    private currentOptions;
    private platformIcons;
    /**
     * Create a new TitleBar instance
     * @param options The options for the title bar
     */
    constructor(options: TitleBarOptions);
    private loadIcons;
    /**
     * Setup the background color of the title bar
     * By default, it will use the meta theme-color or msapplication-TileColor and if it doesn't exist, it will use white
     */
    private setupBackgroundColor;
    /**
     * Render the icon of the title bar, if is mac, it will not render
     * By default, it will use the first icon found in the head of the document
     */
    private createIcon;
    private setIconSize;
    private setupMenubar;
    private setupTitle;
    private createControlButton;
    private setupWindowControls;
    private setupContainer;
    private setupTitleBar;
    private loadEvents;
    private closeMenu;
    private onBlur;
    private onFocus;
    private onMenuBarVisibilityChanged;
    private onMenuBarFocusChanged;
    private onDidChangeMaximized;
    private updateMenu;
    private updateStyles;
    private canCenterTitle;
    /**
     * Update title bar styles based on focus state.
     * @param hasFocus focus state of the window
     */
    onWindowFocus(focus: boolean): void;
    /**
     * Update the full screen state and hide or show the title bar.
     * @param fullscreen Fullscreen state of the window
     */
    onWindowFullScreen(fullscreen: boolean): void;
    /**
     * Update the title of the title bar.
     * You can use this method if change the content of `<title>` tag on your html.
     * @param title The title of the title bar and document.
     */
    updateTitle(title: string): this;
    /**
     * It method set new icon to title-bar-icon of title-bar.
     * @param path path to icon
     */
    updateIcon(path: string): this;
    /**
     * Horizontal alignment of the title.
     * @param side `left`, `center` or `right`.
     */
    updateTitleAlignment(side: 'left' | 'center' | 'right'): this;
    /**
     * Update the background color of the title bar
     * @param backgroundColor The color for the background
     */
    updateBackground(backgroundColor: Color): this;
    /**
     * Update the item background color of the menubar
     * @param itemBGColor The color for the item background
     */
    updateItemBGColor(itemBGColor: Color): this;
    /**
     * Update the menu from Menu.getApplicationMenu()
     */
    refreshMenu(): Promise<this>;
    /**
     * Update the position of menubar.
     * @param menuPosition The position of the menu `left` or `bottom`.
     */
    updateMenuPosition(menuPosition: 'left' | 'bottom'): this;
    /**
     * Remove the titlebar, menubar and all methods.
     */
    dispose(): void;
    get titlebarElement(): HTMLElement;
    get menubarElement(): MenuBar | undefined;
    get containerElement(): HTMLElement;
    get titleElement(): HTMLElement;
}
