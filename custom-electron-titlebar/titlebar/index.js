"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomTitlebar = void 0;
const electron_1 = require("electron");
const color_1 = require("../base/common/color");
const dom_1 = require("../base/common/dom");
const platform_1 = require("../base/common/platform");
const menubar_1 = require("../menubar");
const themebar_1 = require("./themebar");
const consts_1 = require("../consts");
class CustomTitlebar extends _get__("themebar_1").ThemeBar {
  /**
   * Create a new TitleBar instance
   * @param options The options for the title bar
   */
  constructor(options) {
    var _a;
    super();
    this.isInactive = false;
    this.currentOptions = {
      closeable: true,
      enableMnemonics: true,
      // hideWhenClickingClose: false,
      iconSize: 16,
      itemBackgroundColor: undefined,
      maximizable: true,
      menuPosition: 'left',
      menuTransparency: 0,
      minimizable: true,
      onlyShowMenuBar: false,
      shadow: false,
      titleHorizontalAlignment: 'center',
      tooltips: {
        close: 'Close',
        maximize: 'Maximize',
        minimize: 'Minimize',
        restoreDown: 'Restore Down'
      },
      unfocusEffect: true
    };
    // TODO: Refactor, verify if is possible use into menubar
    this.closeMenu = () => {
      if (this.menuBar) {
        this.menuBar.blur();
      }
    };
    this.currentOptions = {
      ...this.currentOptions,
      ...options
    };
    const jWindowIcons = _get__("consts_1").menuIcons[(_a = (0, _get__("platform_1").PlatformToString)(_get__("platform_1").platform)) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()];
    this.platformIcons = jWindowIcons;
    this.titlebar = (0, _get__("dom_1").$)('.cet-titlebar');
    this.dragRegion = (0, _get__("dom_1").$)('.cet-drag-region');
    this.icon = (0, _get__("dom_1").$)('.cet-icon');
    this.menuBarContainer = (0, _get__("dom_1").$)('.cet-menubar');
    this.title = (0, _get__("dom_1").$)('.cet-title');
    this.controlsContainer = (0, _get__("dom_1").$)('.cet-window-controls');
    this.container = (0, _get__("dom_1").$)('.cet-container');
    this.controls = {
      minimize: (0, _get__("dom_1").$)('.cet-control-minimize'),
      maximize: (0, _get__("dom_1").$)('.cet-control-maximize'),
      close: (0, _get__("dom_1").$)('.cet-control-close')
    };
    this.resizer = {
      top: (0, _get__("dom_1").$)('.cet-resizer.top'),
      left: (0, _get__("dom_1").$)('.cet-resizer.left')
    };
    (0, _get__("dom_1").append)(this.titlebar, this.dragRegion);
    (0, _get__("dom_1").append)(this.titlebar, this.resizer.left);
    (0, _get__("dom_1").append)(this.titlebar, this.resizer.top);
    this.loadIcons();
    this.setupBackgroundColor();
    this.createIcon();
    this.setupMenubar();
    this.setupTitle();
    this.setupWindowControls();
    this.setupContainer();
    this.setupTitleBar();
    this.loadEvents();
    // this.registerTheme(ThemeBar.win)
  }
  loadIcons() {
    const icons = this.currentOptions.icons;
    if (icons) {
      const {
        platformIcons
      } = (0, _get__("consts_1").loadWindowIcons)(icons);
      this.platformIcons = platformIcons;
    }
  }
  /**
   * Setup the background color of the title bar
   * By default, it will use the meta theme-color or msapplication-TileColor and if it doesn't exist, it will use white
   */
  setupBackgroundColor() {
    let color = this.currentOptions.backgroundColor;
    if (!color) {
      const metaColor = document.querySelectorAll('meta[name="theme-color"]') || document.querySelectorAll('meta[name="msapplication-TileColor"]');
      metaColor.forEach(meta => {
        color = _get__("color_1").Color.fromHex(meta.getAttribute('content'));
      });
      if (!color) color = _get__("color_1").Color.WHITE;
      this.currentOptions.backgroundColor = color;
    }
    this.titlebar.style.backgroundColor = color.toString();
  }
  /**
   * Render the icon of the title bar, if is mac, it will not render
   * By default, it will use the first icon found in the head of the document
   */
  createIcon() {
    // const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar
    if (_get__("platform_1").isMacintosh) return;
    let icon = this.currentOptions.icon;
    if (!icon) {
      const tagLink = document.querySelectorAll('link');
      tagLink.forEach(link => {
        if (link.getAttribute('rel') === 'icon' || link.getAttribute('rel') === 'shortcut icon') {
          icon = link.getAttribute('href');
        }
        this.currentOptions.icon = icon;
      });
    }
    if (icon) {
      const windowIcon = (0, _get__("dom_1").append)(this.icon, (0, _get__("dom_1").$)('img'));
      if (typeof icon === 'string') {
        windowIcon.setAttribute('src', icon);
      } else {
        windowIcon.setAttribute('src', icon.toDataURL());
      }
      this.setIconSize(this.currentOptions.iconSize);
      (0, _get__("dom_1").append)(this.titlebar, this.icon);
    }
  }
  setIconSize(size) {
    if (size < 16) size = 16;
    if (size > 24) size = 24;
    this.icon.firstElementChild.setAttribute('style', `height: ${size}px`);
  }
  setupMenubar() {
    var _a;
    (_a = _get__("electron_1").ipcRenderer.invoke('request-application-menu')) === null || _a === void 0 ? void 0 : _a.then(menu => this.updateMenu(menu));
    const menuPosition = this.currentOptions.menuPosition;
    if (menuPosition) {
      this.updateMenuPosition(menuPosition);
    }
    (0, _get__("dom_1").append)(this.titlebar, this.menuBarContainer);
  }
  setupTitle() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar;
    if (onlyRendererMenuBar) return;
    this.updateTitle(document.title);
    this.updateTitleAlignment(this.currentOptions.titleHorizontalAlignment);
    (0, _get__("dom_1").append)(this.titlebar, this.title);
  }
  createControlButton(element, icon, title, active = true) {
    (0, _get__("dom_1").addClass)(element, 'cet-control-icon');
    element.innerHTML = icon;
    element.title = title;
    if (!active) {
      (0, _get__("dom_1").addClass)(element, 'inactive');
    }
    (0, _get__("dom_1").append)(this.controlsContainer, element);
  }
  setupWindowControls() {
    var _a, _b, _c;
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar;
    const tooltips = this.currentOptions.tooltips;
    if (_get__("platform_1").isMacintosh || onlyRendererMenuBar) return;
    this.createControlButton(this.controls.minimize, (_a = this.platformIcons) === null || _a === void 0 ? void 0 : _a.minimize, tooltips.minimize, this.currentOptions.minimizable);
    this.createControlButton(this.controls.maximize, (_b = this.platformIcons) === null || _b === void 0 ? void 0 : _b.maximize, tooltips.maximize, this.currentOptions.maximizable);
    this.createControlButton(this.controls.close, (_c = this.platformIcons) === null || _c === void 0 ? void 0 : _c.close, tooltips.close, this.currentOptions.closeable);
    (0, _get__("dom_1").append)(this.titlebar, this.controlsContainer);
  }
  setupContainer() {
    const containerOverflow = this.currentOptions.containerOverflow;
    if (containerOverflow) {
      this.container.style.overflow = containerOverflow;
    }
    while (document.body.firstChild) {
      (0, _get__("dom_1").append)(this.container, document.body.firstChild);
    }
    (0, _get__("dom_1").append)(document.body, this.container);
  }
  setupTitleBar() {
    var _a;
    const order = this.currentOptions.order;
    const hasShadow = this.currentOptions.shadow;
    (0, _get__("dom_1").addClass)(this.titlebar, `cet-${(_a = (0, _get__("platform_1").PlatformToString)(_get__("platform_1").platform)) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()}`);
    if (order) {
      (0, _get__("dom_1").addClass)(this.titlebar, `cet-${order}`);
    }
    if (hasShadow) {
      (0, _get__("dom_1").addClass)(this.titlebar, 'cet-shadow');
    }
    if (!_get__("platform_1").isMacintosh) {
      this.title.style.cursor = 'default';
    }
    (0, _get__("dom_1").prepend)(document.body, this.titlebar);
  }
  loadEvents() {
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar;
    if (onlyRendererMenuBar) return;
    const minimizable = this.currentOptions.minimizable;
    const maximizable = this.currentOptions.maximizable;
    const closeable = this.currentOptions.closeable;
    this.onDidChangeMaximized(_get__("electron_1").ipcRenderer.sendSync('window-event', 'window-is-maximized'));
    _get__("electron_1").ipcRenderer.on('window-maximize', (_, isMaximized) => this.onDidChangeMaximized(isMaximized));
    _get__("electron_1").ipcRenderer.on('window-fullscreen', (_, isFullScreen) => this.onWindowFullScreen(isFullScreen));
    _get__("electron_1").ipcRenderer.on('window-focus', (_, isFocused) => this.onWindowFocus(isFocused));
    if (minimizable) {
      (0, _get__("dom_1").addDisposableListener)(this.controls.minimize, _get__("dom_1").EventType.CLICK, () => {
        _get__("electron_1").ipcRenderer.send('window-event', 'window-minimize');
      });
    }
    if (_get__("platform_1").isMacintosh) {
      (0, _get__("dom_1").addDisposableListener)(this.titlebar, _get__("dom_1").EventType.DBLCLICK, () => {
        _get__("electron_1").ipcRenderer.send('window-event', 'window-maximize');
      });
    }
    if (maximizable) {
      (0, _get__("dom_1").addDisposableListener)(this.controls.maximize, _get__("dom_1").EventType.CLICK, () => {
        _get__("electron_1").ipcRenderer.send('window-event', 'window-maximize');
      });
    }
    if (closeable) {
      (0, _get__("dom_1").addDisposableListener)(this.controls.close, _get__("dom_1").EventType.CLICK, () => {
        _get__("electron_1").ipcRenderer.send('window-event', 'window-close');
      });
    }
  }
  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }
  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }
  onMenuBarVisibilityChanged(visible) {
    if (_get__("platform_1").isWindows || _get__("platform_1").isLinux || _get__("platform_1").isFreeBSD) {
      if (visible) {
        // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
        (0, _get__("dom_1").hide)(this.dragRegion);
        setTimeout(() => (0, _get__("dom_1").show)(this.dragRegion), 50);
      }
    }
  }
  onMenuBarFocusChanged(focused) {
    if (_get__("platform_1").isWindows || _get__("platform_1").isLinux || _get__("platform_1").isFreeBSD) {
      if (focused) (0, _get__("dom_1").hide)(this.dragRegion);else (0, _get__("dom_1").show)(this.dragRegion);
    }
  }
  onDidChangeMaximized(isMaximized) {
    var _a, _b, _c, _d;
    const maximize = this.controls.maximize;
    if (maximize) {
      maximize.title = isMaximized ? (_a = this.currentOptions.tooltips) === null || _a === void 0 ? void 0 : _a.restoreDown : (_b = this.currentOptions.tooltips) === null || _b === void 0 ? void 0 : _b.maximize;
      maximize.innerHTML = isMaximized ? (_c = this.platformIcons) === null || _c === void 0 ? void 0 : _c.restore : (_d = this.platformIcons) === null || _d === void 0 ? void 0 : _d.maximize;
    }
    if (this.resizer) {
      if (isMaximized) (0, _get__("dom_1").hide)(this.resizer.top, this.resizer.left);else (0, _get__("dom_1").show)(this.resizer.top, this.resizer.left);
    }
  }
  updateMenu(menu) {
    if (_get__("platform_1").isMacintosh || !menu) return;
    if (this.menuBar) this.menuBar.dispose();
    this.menuBar = new (_get__("menubar_1").MenuBar)(this.menuBarContainer, _get__("consts_1").menuIcons, this.currentOptions, {
      enableMnemonics: true
    }, this.closeMenu); // TODO: Verify menubar options
    this.menuBar.push(menu);
    this.menuBar.update();
    this.menuBar.onVisibilityChange(e => this.onMenuBarVisibilityChanged(e));
    this.menuBar.onFocusStateChange(e => this.onMenuBarFocusChanged(e));
    this.updateStyles();
  }
  updateStyles() {
    var _a, _b;
    if (this.isInactive) {
      (0, _get__("dom_1").addClass)(this.titlebar, 'inactive');
    } else {
      (0, _get__("dom_1").removeClass)(this.titlebar, 'inactive');
    }
    const backgroundColor = this.isInactive && this.currentOptions.unfocusEffect ? (_a = this.currentOptions.backgroundColor) === null || _a === void 0 ? void 0 : _a.lighten(0.12) : this.currentOptions.backgroundColor;
    if (backgroundColor) {
      this.titlebar.style.backgroundColor = backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.toString();
    }
    let foregroundColor;
    if (backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.isLighter()) {
      (0, _get__("dom_1").addClass)(this.titlebar, 'light');
      foregroundColor = this.isInactive && this.currentOptions.unfocusEffect ? _get__("consts_1").INACTIVE_FOREGROUND_DARK : _get__("consts_1").ACTIVE_FOREGROUND_DARK;
    } else {
      (0, _get__("dom_1").removeClass)(this.titlebar, 'light');
      foregroundColor = this.isInactive && this.currentOptions.unfocusEffect ? _get__("consts_1").INACTIVE_FOREGROUND : _get__("consts_1").ACTIVE_FOREGROUND;
    }
    this.titlebar.style.color = foregroundColor === null || foregroundColor === void 0 ? void 0 : foregroundColor.toString();
    const updatedWindowControls = _get__("electron_1").ipcRenderer.sendSync('update-window-controls', {
      color: backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.toString(),
      symbolColor: foregroundColor === null || foregroundColor === void 0 ? void 0 : foregroundColor.toString(),
      height: _get__("consts_1").TOP_TITLEBAR_HEIGHT_WIN
    });
    if (updatedWindowControls) {
      (0, _get__("dom_1").hide)(this.controlsContainer);
    } else {
      (0, _get__("dom_1").show)(this.controlsContainer);
    }
    if (this.menuBar) {
      let fgColor;
      const backgroundColor = this.currentOptions.menuBarBackgroundColor || this.currentOptions.backgroundColor.darken(0.12);
      const foregroundColor = (backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.isLighter()) ? _get__("consts_1").INACTIVE_FOREGROUND_DARK : _get__("consts_1").INACTIVE_FOREGROUND;
      const bgColor = this.currentOptions.itemBackgroundColor && !this.currentOptions.itemBackgroundColor.equals(backgroundColor) ? this.currentOptions.itemBackgroundColor : _get__("consts_1").DEFAULT_ITEM_SELECTOR;
      if (bgColor === null || bgColor === void 0 ? void 0 : bgColor.equals(_get__("consts_1").DEFAULT_ITEM_SELECTOR)) {
        fgColor = (backgroundColor === null || backgroundColor === void 0 ? void 0 : backgroundColor.isLighter()) ? _get__("consts_1").ACTIVE_FOREGROUND_DARK : _get__("consts_1").ACTIVE_FOREGROUND;
      } else {
        fgColor = (bgColor === null || bgColor === void 0 ? void 0 : bgColor.isLighter()) ? _get__("consts_1").ACTIVE_FOREGROUND_DARK : _get__("consts_1").ACTIVE_FOREGROUND;
      }
      this.menuBar.setStyles({
        backgroundColor,
        foregroundColor,
        selectionBackgroundColor: bgColor,
        selectionForegroundColor: fgColor,
        separatorColor: (_b = this.currentOptions.menuSeparatorColor) !== null && _b !== void 0 ? _b : foregroundColor,
        svgColor: this.currentOptions.svgColor
      });
    }
  }
  canCenterTitle() {
    const menuBarContainerMargin = 20;
    const menuSpaceLimit = window.innerWidth / 2 - this.menuBarContainer.getBoundingClientRect().right - menuBarContainerMargin;
    return this.title.getBoundingClientRect().width / 2 <= menuSpaceLimit;
  }
  /// Public methods
  /**
   * Update title bar styles based on focus state.
   * @param hasFocus focus state of the window
   */
  onWindowFocus(focus) {
    var _a;
    if (this.titlebar) {
      if (focus) {
        (0, _get__("dom_1").removeClass)(this.titlebar, 'inactive');
        this.onFocus();
      } else {
        (0, _get__("dom_1").addClass)(this.titlebar, 'inactive');
        (_a = this.menuBar) === null || _a === void 0 ? void 0 : _a.blur();
        this.onBlur();
      }
    }
  }
  /**
   * Update the full screen state and hide or show the title bar.
   * @param fullscreen Fullscreen state of the window
   */
  onWindowFullScreen(fullscreen) {
    const height = _get__("platform_1").isMacintosh ? _get__("consts_1").TOP_TITLEBAR_HEIGHT_MAC : _get__("consts_1").TOP_TITLEBAR_HEIGHT_WIN;
    const hasShadow = this.currentOptions.shadow;
    if (!_get__("platform_1").isMacintosh) {
      if (fullscreen) {
        (0, _get__("dom_1").hide)(this.titlebar);
        this.container.style.top = '0px';
      } else {
        (0, _get__("dom_1").show)(this.titlebar);
        if (this.currentOptions.menuPosition === 'bottom') {
          this.container.style.top = (0, _get__("consts_1").getPx)(_get__("consts_1").BOTTOM_TITLEBAR_HEIGHT);
          this.controlsContainer.style.height = (0, _get__("consts_1").getPx)(_get__("consts_1").TOP_TITLEBAR_HEIGHT_WIN);
        } else {
          this.container.style.top = (0, _get__("consts_1").getPx)(height + (hasShadow ? 1 : 0));
        }
      }
    }
  }
  /**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html.
   * @param title The title of the title bar and document.
   */
  updateTitle(title) {
    this.title.innerText = title;
    document.title = title;
    return this;
  }
  /**
   * It method set new icon to title-bar-icon of title-bar.
   * @param path path to icon
   */
  updateIcon(path) {
    if (this.icon) {
      this.icon.firstElementChild.setAttribute('src', path);
    }
    return this;
  }
  /**
   * Horizontal alignment of the title.
   * @param side `left`, `center` or `right`.
   */
  updateTitleAlignment(side) {
    const order = this.currentOptions.order;
    const menuPosition = this.currentOptions.menuPosition;
    if (side === 'left' || side === 'right' && order === 'inverted') {
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-left');
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-right');
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-center');
      (0, _get__("dom_1").addClass)(this.title, 'cet-title-left');
    }
    if (side === 'right' || side === 'left' && order === 'inverted') {
      if (side !== 'left' && order !== 'inverted') {
        this.controlsContainer.style.marginLeft = '10px';
      }
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-left');
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-right');
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-center');
      (0, _get__("dom_1").addClass)(this.title, 'cet-title-right');
    }
    if (side === 'center') {
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-left');
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-right');
      (0, _get__("dom_1").removeClass)(this.title, 'cet-title-center');
      if (menuPosition !== 'bottom') {
        (0, _get__("dom_1").addDisposableListener)(window, 'resize', () => {
          if (this.canCenterTitle()) {
            (0, _get__("dom_1").addClass)(this.title, 'cet-title-center');
          } else {
            (0, _get__("dom_1").removeClass)(this.title, 'cet-title-center');
          }
        });
        if (this.canCenterTitle()) {
          (0, _get__("dom_1").addClass)(this.title, 'cet-title-center');
        }
      }
      if (!_get__("platform_1").isMacintosh && order === 'first-buttons') {
        this.controlsContainer.style.marginLeft = 'auto';
      }
      this.title.style.maxWidth = 'calc(100% - 296px)';
    }
    return this;
  }
  /**
   * Update the background color of the title bar
   * @param backgroundColor The color for the background
   */
  updateBackground(backgroundColor) {
    if (typeof backgroundColor === 'string') backgroundColor = _get__("color_1").Color.fromHex(backgroundColor);
    this.currentOptions.backgroundColor = backgroundColor;
    this.updateStyles();
    return this;
  }
  /**
   * Update the item background color of the menubar
   * @param itemBGColor The color for the item background
   */
  updateItemBGColor(itemBGColor) {
    if (typeof itemBGColor === 'string') itemBGColor = _get__("color_1").Color.fromHex(itemBGColor);
    this.currentOptions.itemBackgroundColor = itemBGColor;
    this.updateStyles();
    return this;
  }
  /**
   * Update the menu from Menu.getApplicationMenu()
   */
  async refreshMenu() {
    if (!_get__("platform_1").isMacintosh) {
      _get__("electron_1").ipcRenderer.invoke('request-application-menu').then(menu => this.updateMenu(menu));
    }
    return this;
  }
  /**
   * Update the position of menubar.
   * @param menuPosition The position of the menu `left` or `bottom`.
   */
  updateMenuPosition(menuPosition) {
    const height = _get__("platform_1").isMacintosh ? _get__("consts_1").TOP_TITLEBAR_HEIGHT_MAC : _get__("consts_1").TOP_TITLEBAR_HEIGHT_WIN;
    const onlyRendererMenuBar = this.currentOptions.onlyShowMenuBar;
    const hasShadow = this.currentOptions.shadow;
    this.currentOptions.menuPosition = menuPosition;
    if (menuPosition === 'left' || onlyRendererMenuBar) {
      this.titlebar.style.height = (0, _get__("consts_1").getPx)(height + (hasShadow ? 1 : 0));
      this.container.style.top = (0, _get__("consts_1").getPx)(height + (hasShadow ? 1 : 0));
      (0, _get__("dom_1").removeClass)(this.menuBarContainer, 'bottom');
    } else {
      this.titlebar.style.height = (0, _get__("consts_1").getPx)(_get__("consts_1").BOTTOM_TITLEBAR_HEIGHT);
      this.container.style.top = (0, _get__("consts_1").getPx)(_get__("consts_1").BOTTOM_TITLEBAR_HEIGHT);
      this.controlsContainer.style.height = (0, _get__("consts_1").getPx)(height);
      (0, _get__("dom_1").addClass)(this.menuBarContainer, 'bottom');
    }
    return this;
  }
  /**
   * Remove the titlebar, menubar and all methods.
   */
  dispose() {
    // if (this.menuBar) this.menuBar.dispose()
    this.titlebar.remove();
    while (this.container.firstChild) (0, _get__("dom_1").append)(document.body, this.container.firstChild);
    this.container.remove();
  }
  get titlebarElement() {
    return this.titlebar;
  }
  get menubarElement() {
    return this.menuBar;
  }
  get containerElement() {
    return this.container;
  }
  get titleElement() {
    return this.title;
  }
}
exports.CustomTitlebar = _get__("CustomTitlebar");
function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}
;
var _RewireModuleId__ = null;
function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    let globalVariable = _getGlobalObject();
    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }
    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }
  return _RewireModuleId__;
}
function _getRewireRegistry__() {
  let theGlobalVariable = _getGlobalObject();
  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
  }
  return theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__;
}
function _getRewiredData__() {
  let moduleId = _getRewireModuleId__();
  let registry = _getRewireRegistry__();
  let rewireData = registry[moduleId];
  if (!rewireData) {
    registry[moduleId] = Object.create(null);
    rewireData = registry[moduleId];
  }
  return rewireData;
}
(function registerResetAll() {
  let theGlobalVariable = _getGlobalObject();
  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
    };
  }
})();
var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
let _RewireAPI__ = {};
(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }
  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();
function _get__(variableName) {
  let rewireData = _getRewiredData__();
  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];
    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}
function _get_original__(variableName) {
  switch (variableName) {
    case "consts_1":
      return consts_1;
    case "platform_1":
      return platform_1;
    case "dom_1":
      return dom_1;
    case "color_1":
      return color_1;
    case "electron_1":
      return electron_1;
    case "menubar_1":
      return menubar_1;
    case "themebar_1":
      return themebar_1;
    case "CustomTitlebar":
      return CustomTitlebar;
  }
  return undefined;
}
function _assign__(variableName, value) {
  let rewireData = _getRewiredData__();
  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
  }
}
function _set_original__(variableName, _value) {
  switch (variableName) {}
  return undefined;
}
function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);
  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;
  _assign__(variableName, newValue);
  return prefix ? newValue : oldValue;
}
function _set__(variableName, value) {
  let rewireData = _getRewiredData__();
  if (typeof variableName === 'object') {
    Object.keys(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
    return function () {
      Object.keys(variableName).forEach(function (name) {
        _reset__(variableName);
      });
    };
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }
    return function () {
      _reset__(variableName);
    };
  }
}
function _reset__(variableName) {
  let rewireData = _getRewiredData__();
  delete rewireData[variableName];
  if (Object.keys(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }
  ;
}
function _with__(object) {
  let rewireData = _getRewiredData__();
  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};
  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }
  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
    });
    let result = callback();
    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }
    return result;
  };
}
let _typeOfOriginalExport = typeof module.exports;
function addNonEnumerableProperty(name, value) {
  Object.defineProperty(module.exports, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}
if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(module.exports)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}