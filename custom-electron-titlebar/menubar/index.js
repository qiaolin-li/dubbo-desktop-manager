"use strict";

/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) _get__("__createBinding")(result, mod, k);
  _get__("__setModuleDefault")(result, mod);
  return result;
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuBar = void 0;
const electron_1 = require("electron");
const DOM = _get__("__importStar")(require("../base/common/dom"));
const event_1 = require("../base/common/event");
const lifecycle_1 = require("../base/common/lifecycle");
const platform_1 = require("../base/common/platform");
const keyboardEvent_1 = require("../base/browser/keyboardEvent");
const keyCodes_1 = require("../base/common/keyCodes");
const consts_1 = require("../consts");
const menu_1 = require("./menu");
const async_1 = require("../base/common/async");
const mouseEvent_1 = require("../base/browser/mouseEvent");
const touch_1 = require("../base/browser/touch");
const strings = _get__("__importStar")(require("../base/common/strings"));
const $ = _get__("DOM").$;
var MenubarState;
(function (MenubarState) {
  MenubarState[MenubarState["HIDDEN"] = 0] = "HIDDEN";
  MenubarState[MenubarState["VISIBLE"] = 1] = "VISIBLE";
  MenubarState[MenubarState["FOCUSED"] = 2] = "FOCUSED";
  MenubarState[MenubarState["OPEN"] = 3] = "OPEN";
})(_get__("MenubarState") || _assign__("MenubarState", {}));
class MenuBar extends _get__("lifecycle_1").Disposable {
  constructor(container, menuIcons, currentOptions, options, closeMenu = () => {}) {
    super();
    this.container = container;
    this.menuIcons = menuIcons;
    this.currentOptions = currentOptions;
    this.options = options;
    this.closeMenu = closeMenu;
    // Input-related
    this._mnemonicsInUse = false;
    this.openedViaKeyboard = false;
    this.awaitingAltRelease = false;
    this.ignoreNextMouseUp = false;
    this.updatePending = false;
    this.numMenusShown = 0;
    this.overflowLayoutScheduled = undefined;
    this.menuStyle = {};
    this.container.setAttribute('role', 'menubar');
    if (this.isCompact) {
      this.container.classList.add('compact');
    }
    this.menus = [];
    this.mnemonics = new Map();
    this._focusState = _get__("MenubarState").VISIBLE;
    this._onVisibilityChange = this._register(new (_get__("event_1").Emitter)());
    this._onFocusStateChange = this._register(new (_get__("event_1").Emitter)());
    this.createOverflowMenu();
    this.menuUpdater = this._register(new (_get__("async_1").RunOnceScheduler)(() => this.update(), 200));
    // this.actionRunner = this.options.actionRunner ?? this._register(new ActionRunner());
    this.registerListeners();
    this.setUnfocusedState();
  }
  registerListeners() {
    /* this._register(this.actionRunner.onWillRun(() => {
        this.setUnfocusedState();
    })); */
    if (!_get__("platform_1").isMacintosh) {
      this._register(_get__("DOM").addDisposableListener(window, _get__("DOM").EventType.RESIZE, () => {
        this.blur();
      }));
    }
    this._register(_get__("DOM").ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this));
    this._register(_get__("DOM").addDisposableListener(this.container, _get__("DOM").EventType.KEY_DOWN, e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      let eventHandled = true;
      const key = !!e.key ? e.key.toLocaleLowerCase() : '';
      const tabNav = _get__("platform_1").isMacintosh && !this.isCompact;
      if (event.equals(15 /* KeyCode.LeftArrow */) || tabNav && event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */)) {
        this.focusPrevious();
      } else if (event.equals(17 /* KeyCode.RightArrow */) || tabNav && event.equals(2 /* KeyCode.Tab */)) {
        this.focusNext();
      } else if (event.equals(9 /* KeyCode.Escape */) && this.isFocused && !this.isOpen) {
        this.setUnfocusedState();
      } else if (!this.isOpen && !event.ctrlKey && this.options.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key)) {
        const menuIndex = this.mnemonics.get(key);
        this.onMenuTriggered(menuIndex, false);
      } else {
        eventHandled = false;
      }
      // Never allow default tab behavior when not compact
      if (!this.isCompact && (event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */) || event.equals(2 /* KeyCode.Tab */))) {
        event.preventDefault();
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    this._register(_get__("DOM").addDisposableListener(window, _get__("DOM").EventType.MOUSE_DOWN, () => {
      // This mouse event is outside the menubar so it counts as a focus out
      if (this.isFocused) {
        this.setUnfocusedState();
      }
    }));
    this._register(_get__("DOM").addDisposableListener(this.container, _get__("DOM").EventType.FOCUS_IN, e => {
      const event = e;
      if (event.relatedTarget) {
        if (!this.container.contains(event.relatedTarget)) {
          this.focusToReturn = event.relatedTarget;
        }
      }
    }));
    this._register(_get__("DOM").addDisposableListener(this.container, _get__("DOM").EventType.FOCUS_OUT, e => {
      const event = e;
      // We are losing focus and there is a target, reset focusToReturn value as not to redirect
      if (event.relatedTarget && !this.container.contains(event.relatedTarget)) {
        this.focusToReturn = undefined;
        this.setUnfocusedState();
      }
    }));
    this._register(_get__("DOM").addDisposableListener(window, _get__("DOM").EventType.KEY_DOWN, e => {
      if (!this.options.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
        return;
      }
      const key = e.key.toLocaleLowerCase();
      if (!this.mnemonics.has(key)) {
        return;
      }
      this.mnemonicsInUse = true;
      this.updateMnemonicVisibility(true);
      const menuIndex = this.mnemonics.get(key);
      this.onMenuTriggered(menuIndex, false);
    }));
  }
  push(menu) {
    const topLevelMenus = menu.items;
    topLevelMenus.forEach(menuBarMenu => {
      const menuIndex = this.menus.length;
      const cleanMenuLabel = (0, _get__("consts_1").cleanMnemonic)(menuBarMenu.label);
      const mnemonicMatches = _get__("consts_1").MENU_MNEMONIC_REGEX.exec(menuBarMenu.label);
      // Register mnemonics
      if (mnemonicMatches) {
        const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
        this.registerMnemonic(this.menus.length, mnemonic);
      }
      if (this.isCompact) {
        this.menus.push({
          label: '',
          actions: menuBarMenu.submenu
        });
      } else {
        const buttonElement = _get__("$")('.cet-menubar-menu-button', {
          role: 'menuitem',
          tabindex: -1,
          'aria-label': cleanMenuLabel,
          'aria-haspopup': true
        });
        const titleElement = _get__("$")('.cet-menubar-menu-title', {
          role: 'none',
          'aria-hidden': true
        });
        buttonElement.appendChild(titleElement);
        this.container.insertBefore(buttonElement, this.overflowMenu.buttonElement);
        this.updateLabels(titleElement, buttonElement, menuBarMenu.label);
        this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.KEY_UP, e => {
          const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
          let eventHandled = true;
          if ((event.equals(18 /* KeyCode.DownArrow */) || event.equals(3 /* KeyCode.Enter */)) && !this.isOpen) {
            this.focusedMenu = {
              index: menuIndex
            };
            this.openedViaKeyboard = true;
            this.focusState = _get__("MenubarState").OPEN;
          } else {
            eventHandled = false;
          }
          if (eventHandled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }));
        this._register(_get__("touch_1").Gesture.addTarget(buttonElement));
        this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("touch_1").EventType.Tap, e => {
          // Ignore this touch if the menu is touched
          if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && _get__("DOM").isAncestor(e.initialTarget, this.focusedMenu.holder)) {
            return;
          }
          this.ignoreNextMouseUp = false;
          this.onMenuTriggered(menuIndex, true);
          e.preventDefault();
          e.stopPropagation();
        }));
        this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.MOUSE_DOWN, e => {
          // Ignore non-left-click
          const mouseEvent = new (_get__("mouseEvent_1").StandardMouseEvent)(e);
          if (!mouseEvent.leftButton) {
            e.preventDefault();
            return;
          }
          if (!this.isOpen) {
            // Open the menu with mouse down and ignore the following mouse up event
            this.ignoreNextMouseUp = true;
            this.onMenuTriggered(menuIndex, true);
          } else {
            this.ignoreNextMouseUp = false;
          }
          e.preventDefault();
          e.stopPropagation();
        }));
        this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.MOUSE_UP, e => {
          if (e.defaultPrevented) {
            return;
          }
          if (!this.ignoreNextMouseUp) {
            if (this.isFocused) {
              this.onMenuTriggered(menuIndex, true);
            }
          } else {
            this.ignoreNextMouseUp = false;
          }
        }));
        this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.MOUSE_ENTER, () => {
          if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
            buttonElement.focus();
            this.cleanupMenu();
            this.showMenu(menuIndex, false);
          } else if (this.isFocused && !this.isOpen) {
            this.focusedMenu = {
              index: menuIndex
            };
            buttonElement.focus();
          }
        }));
        this.menus.push({
          label: menuBarMenu.label,
          actions: menuBarMenu.submenu,
          buttonElement,
          titleElement
        });
      }
    });
  }
  createOverflowMenu() {
    const label = this.isCompact ? 'Compact' : 'More';
    const buttonElement = _get__("$")('.cet-menubar-menu-button', {
      role: 'menuitem',
      tabindex: this.isCompact ? 0 : -1,
      'aria-label': label,
      'aria-haspopup': true
    });
    const titleElement = _get__("$")('.cet-menubar-menu-title.cet-toggle-more', {
      role: 'none',
      'aria-hidden': true
    });
    buttonElement.appendChild(titleElement);
    this.container.appendChild(buttonElement);
    buttonElement.style.visibility = 'hidden';
    this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.KEY_UP, e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      let eventHandled = true;
      const triggerKeys = [3 /* KeyCode.Enter */];
      if (!this.isCompact) {
        triggerKeys.push(18 /* KeyCode.DownArrow */);
      } else {
        triggerKeys.push(10 /* KeyCode.Space */);
        if (this.options.compactMode === _get__("menu_1").Direction.Right) {
          triggerKeys.push(17 /* KeyCode.RightArrow */);
        } else if (this.options.compactMode === _get__("menu_1").Direction.Left) {
          triggerKeys.push(15 /* KeyCode.LeftArrow */);
        }
      }
      if (triggerKeys.some(k => event.equals(k)) && !this.isOpen) {
        this.focusedMenu = {
          index: _get__("MenuBar").OVERFLOW_INDEX
        };
        this.openedViaKeyboard = true;
        this.focusState = _get__("MenubarState").OPEN;
      } else {
        eventHandled = false;
      }
      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    this._register(_get__("touch_1").Gesture.addTarget(buttonElement));
    this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("touch_1").EventType.Tap, e => {
      // Ignore this touch if the menu is touched
      if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && _get__("DOM").isAncestor(e.initialTarget, this.focusedMenu.holder)) {
        return;
      }
      this.ignoreNextMouseUp = false;
      this.onMenuTriggered(_get__("MenuBar").OVERFLOW_INDEX, true);
      e.preventDefault();
      e.stopPropagation();
    }));
    this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.MOUSE_DOWN, e => {
      // Ignore non-left-click
      const mouseEvent = new (_get__("mouseEvent_1").StandardMouseEvent)(e);
      if (!mouseEvent.leftButton) {
        e.preventDefault();
        return;
      }
      if (!this.isOpen) {
        // Open the menu with mouse down and ignore the following mouse up event
        this.ignoreNextMouseUp = true;
        this.onMenuTriggered(_get__("MenuBar").OVERFLOW_INDEX, true);
      } else {
        this.ignoreNextMouseUp = false;
      }
      e.preventDefault();
      e.stopPropagation();
    }));
    this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.MOUSE_UP, e => {
      if (e.defaultPrevented) {
        return;
      }
      if (!this.ignoreNextMouseUp) {
        if (this.isFocused) {
          this.onMenuTriggered(_get__("MenuBar").OVERFLOW_INDEX, true);
        }
      } else {
        this.ignoreNextMouseUp = false;
      }
    }));
    this._register(_get__("DOM").addDisposableListener(buttonElement, _get__("DOM").EventType.MOUSE_ENTER, () => {
      if (this.isOpen && !this.isCurrentMenu(_get__("MenuBar").OVERFLOW_INDEX)) {
        this.overflowMenu.buttonElement.focus();
        this.cleanupMenu();
        this.showMenu(_get__("MenuBar").OVERFLOW_INDEX, false);
      } else if (this.isFocused && !this.isOpen) {
        this.focusedMenu = {
          index: _get__("MenuBar").OVERFLOW_INDEX
        };
        buttonElement.focus();
      }
    }));
    this.overflowMenu = {
      buttonElement,
      titleElement,
      label: 'More'
    };
  }
  setStyles(style) {
    this.menuStyle = style;
  }
  updateMenu(menu) {
    const menuToUpdate = this.menus.filter(menuBarMenu => menuBarMenu.label === menu.label);
    if (menuToUpdate && menuToUpdate.length) {
      // menuToUpdate[0].actions = menu.actions;
    }
  }
  dispose() {
    super.dispose();
    this.menus.forEach(menuBarMenu => {
      var _a, _b;
      (_a = menuBarMenu.titleElement) === null || _a === void 0 ? void 0 : _a.remove();
      (_b = menuBarMenu.buttonElement) === null || _b === void 0 ? void 0 : _b.remove();
    });
    this.overflowMenu.titleElement.remove();
    this.overflowMenu.buttonElement.remove();
    (0, _get__("lifecycle_1").dispose)(this.overflowLayoutScheduled);
    this.overflowLayoutScheduled = undefined;
  }
  blur() {
    this.setUnfocusedState();
  }
  getWidth() {
    if (!this.isCompact && this.menus) {
      const left = this.menus[0].buttonElement.getBoundingClientRect().left;
      const right = this.hasOverflow ? this.overflowMenu.buttonElement.getBoundingClientRect().right : this.menus[this.menus.length - 1].buttonElement.getBoundingClientRect().right;
      return right - left;
    }
    return 0;
  }
  getHeight() {
    return this.container.clientHeight;
  }
  toggleFocus() {
    if (!this.isFocused && this.options.visibility !== 'hidden') {
      this.mnemonicsInUse = true;
      this.focusedMenu = {
        index: this.numMenusShown > 0 ? 0 : _get__("MenuBar").OVERFLOW_INDEX
      };
      this.focusState = _get__("MenubarState").FOCUSED;
    } else if (!this.isOpen) {
      this.setUnfocusedState();
    }
  }
  updateOverflowAction() {
    if (!this.menus || !this.menus.length) {
      return;
    }
    const overflowMenuOnlyClass = 'overflow-menu-only';
    // Remove overflow only restriction to allow the most space
    this.container.classList.toggle(overflowMenuOnlyClass, false);
    const sizeAvailable = this.container.offsetWidth;
    let currentSize = 0;
    let full = this.isCompact;
    const prevNumMenusShown = this.numMenusShown;
    this.numMenusShown = 0;
    const showableMenus = this.menus.filter(menu => menu.buttonElement !== undefined && menu.titleElement !== undefined);
    for (const menuBarMenu of showableMenus) {
      if (!full) {
        const size = menuBarMenu.buttonElement.offsetWidth;
        if (currentSize + size > sizeAvailable) {
          full = true;
        } else {
          currentSize += size;
          this.numMenusShown++;
          if (this.numMenusShown > prevNumMenusShown) {
            menuBarMenu.buttonElement.style.visibility = 'visible';
          }
        }
      }
      if (full) {
        menuBarMenu.buttonElement.style.visibility = 'hidden';
      }
    }
    // If below minimium menu threshold, show the overflow menu only as hamburger menu
    if (this.numMenusShown - 1 <= showableMenus.length / 2) {
      for (const menuBarMenu of showableMenus) {
        menuBarMenu.buttonElement.style.visibility = 'hidden';
      }
      full = true;
      this.numMenusShown = 0;
      currentSize = 0;
    }
    // Overflow
    if (this.isCompact) {
      // this.overflowMenu.actions = [];
      for (let idx = this.numMenusShown; idx < this.menus.length; idx++) {
        // this.overflowMenu.actions.push(new SubmenuAction(`menubar.submenu.${this.menus[idx].label}`, this.menus[idx].label, this.menus[idx].actions || []));
      }
      /* const compactMenuActions = this.options.getCompactMenuActions?.();
      if (compactMenuActions && compactMenuActions.length) {
          //this.overflowMenu.actions.push(new Separator());
          this.overflowMenu.actions.push(...compactMenuActions);
      } */
      this.overflowMenu.buttonElement.style.visibility = 'visible';
    } else if (full) {
      // Can't fit the more button, need to remove more menus
      while (currentSize + this.overflowMenu.buttonElement.offsetWidth > sizeAvailable && this.numMenusShown > 0) {
        this.numMenusShown--;
        const size = showableMenus[this.numMenusShown].buttonElement.offsetWidth;
        showableMenus[this.numMenusShown].buttonElement.style.visibility = 'hidden';
        currentSize -= size;
      }
      // this.overflowMenu.actions = [];
      for (let idx = this.numMenusShown; idx < showableMenus.length; idx++) {
        // this.overflowMenu.actions.push(new SubmenuAction(`menubar.submenu.${showableMenus[idx].label}`, showableMenus[idx].label, showableMenus[idx].actions || []));
      }
      if (this.overflowMenu.buttonElement.nextElementSibling !== showableMenus[this.numMenusShown].buttonElement) {
        this.overflowMenu.buttonElement.remove();
        this.container.insertBefore(this.overflowMenu.buttonElement, showableMenus[this.numMenusShown].buttonElement);
      }
      this.overflowMenu.buttonElement.style.visibility = 'visible';
    } else {
      this.overflowMenu.buttonElement.remove();
      this.container.appendChild(this.overflowMenu.buttonElement);
      this.overflowMenu.buttonElement.style.visibility = 'hidden';
    }
    // If we are only showing the overflow, add this class to avoid taking up space
    this.container.classList.toggle(overflowMenuOnlyClass, this.numMenusShown === 0);
  }
  updateLabels(titleElement, buttonElement, label) {
    const cleanMenuLabel = (0, _get__("consts_1").cleanMnemonic)(label);
    // Update the button label to reflect mnemonics
    if (this.options.enableMnemonics) {
      const cleanLabel = _get__("strings").escape(label);
      // This is global so reset it
      _get__("consts_1").MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
      let escMatch = _get__("consts_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      // We can't use negative lookbehind so we match our negative and skip
      while (escMatch && escMatch[1]) {
        escMatch = _get__("consts_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
      }
      const replaceDoubleEscapes = str => str.replace(/&amp;&amp;/g, '&amp;');
      if (escMatch) {
        titleElement.innerText = '';
        titleElement.append(_get__("strings").ltrim(replaceDoubleEscapes(cleanLabel.substring(0, escMatch.index)), ' '), _get__("$")('mnemonic', {
          'aria-hidden': 'true'
        }, escMatch[3]), _get__("strings").rtrim(replaceDoubleEscapes(cleanLabel.substring(escMatch.index + escMatch[0].length)), ' '));
      } else {
        titleElement.innerText = replaceDoubleEscapes(cleanLabel).trim();
      }
    } else {
      titleElement.innerText = cleanMenuLabel.replace(/&&/g, '&');
    }
    const mnemonicMatches = _get__("consts_1").MENU_MNEMONIC_REGEX.exec(label);
    // Register mnemonics
    if (mnemonicMatches) {
      const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
      if (this.options.enableMnemonics) {
        buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
      } else {
        buttonElement.removeAttribute('aria-keyshortcuts');
      }
    }
  }
  update(options) {
    if (options) {
      this.options = options;
    }
    // Don't update while using the menu
    if (this.isFocused) {
      this.updatePending = true;
      return;
    }
    this.menus.forEach(menuBarMenu => {
      if (!menuBarMenu.buttonElement || !menuBarMenu.titleElement) {
        return;
      }
      this.updateLabels(menuBarMenu.titleElement, menuBarMenu.buttonElement, menuBarMenu.label);
    });
    if (!this.overflowLayoutScheduled) {
      this.overflowLayoutScheduled = _get__("DOM").scheduleAtNextAnimationFrame(() => {
        this.updateOverflowAction();
        this.overflowLayoutScheduled = undefined;
      });
    }
    this.setUnfocusedState();
  }
  registerMnemonic(menuIndex, mnemonic) {
    this.mnemonics.set(mnemonic.toLocaleLowerCase(), menuIndex);
  }
  hideMenubar() {
    if (this.container.style.display !== 'none') {
      this.container.style.display = 'none';
      this._onVisibilityChange.fire(false);
    }
  }
  showMenubar() {
    if (this.container.style.display !== 'flex') {
      this.container.style.display = 'flex';
      this._onVisibilityChange.fire(true);
      this.updateOverflowAction();
    }
  }
  get focusState() {
    return this._focusState;
  }
  set focusState(value) {
    var _a, _b;
    if (this._focusState >= _get__("MenubarState").FOCUSED && value < _get__("MenubarState").FOCUSED) {
      // Losing focus, update the menu if needed
      if (this.updatePending) {
        this.menuUpdater.schedule();
        this.updatePending = false;
      }
    }
    if (value === this._focusState) {
      return;
    }
    const isVisible = this.isVisible;
    const isOpen = this.isOpen;
    const isFocused = this.isFocused;
    this._focusState = value;
    switch (value) {
      case _get__("MenubarState").HIDDEN:
        if (isVisible) {
          this.hideMenubar();
        }
        if (isOpen) {
          this.cleanupMenu();
        }
        if (isFocused) {
          this.focusedMenu = undefined;
          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = undefined;
          }
        }
        break;
      case _get__("MenubarState").VISIBLE:
        if (!isVisible) {
          this.showMenubar();
        }
        if (isOpen) {
          this.cleanupMenu();
        }
        if (isFocused) {
          if (this.focusedMenu) {
            if (this.focusedMenu.index === _get__("MenuBar").OVERFLOW_INDEX) {
              this.overflowMenu.buttonElement.blur();
            } else {
              (_a = this.menus[this.focusedMenu.index].buttonElement) === null || _a === void 0 ? void 0 : _a.blur();
            }
          }
          this.focusedMenu = undefined;
          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = undefined;
          }
        }
        break;
      case _get__("MenubarState").FOCUSED:
        if (!isVisible) {
          this.showMenubar();
        }
        if (isOpen) {
          this.cleanupMenu();
        }
        if (this.focusedMenu) {
          if (this.focusedMenu.index === _get__("MenuBar").OVERFLOW_INDEX) {
            this.overflowMenu.buttonElement.focus();
          } else {
            (_b = this.menus[this.focusedMenu.index].buttonElement) === null || _b === void 0 ? void 0 : _b.focus();
          }
        }
        break;
      case _get__("MenubarState").OPEN:
        if (!isVisible) {
          this.showMenubar();
        }
        if (this.focusedMenu) {
          this.showMenu(this.focusedMenu.index, this.openedViaKeyboard);
        }
        break;
    }
    this._focusState = value;
    this._onFocusStateChange.fire(this.focusState >= _get__("MenubarState").FOCUSED);
  }
  get isVisible() {
    return this.focusState >= _get__("MenubarState").VISIBLE;
  }
  get isFocused() {
    return this.focusState >= _get__("MenubarState").FOCUSED;
  }
  get isOpen() {
    return this.focusState >= _get__("MenubarState").OPEN;
  }
  get hasOverflow() {
    return this.isCompact || this.numMenusShown < this.menus.length;
  }
  get isCompact() {
    return this.options.compactMode !== undefined;
  }
  setUnfocusedState() {
    if (this.options.visibility === 'toggle' || this.options.visibility === 'hidden') {
      this.focusState = _get__("MenubarState").HIDDEN;
    } else if (this.options.visibility === 'classic') {
      this.focusState = _get__("MenubarState").HIDDEN;
    } else {
      this.focusState = _get__("MenubarState").VISIBLE;
    }
    this.ignoreNextMouseUp = false;
    this.mnemonicsInUse = false;
    this.updateMnemonicVisibility(false);
  }
  focusPrevious() {
    var _a;
    if (!this.focusedMenu || this.numMenusShown === 0) {
      return;
    }
    let newFocusedIndex = (this.focusedMenu.index - 1 + this.numMenusShown) % this.numMenusShown;
    if (this.focusedMenu.index === _get__("MenuBar").OVERFLOW_INDEX) {
      newFocusedIndex = this.numMenusShown - 1;
    } else if (this.focusedMenu.index === 0 && this.hasOverflow) {
      newFocusedIndex = _get__("MenuBar").OVERFLOW_INDEX;
    }
    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }
    if (this.isOpen) {
      this.cleanupMenu();
      this.showMenu(newFocusedIndex);
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      if (newFocusedIndex === _get__("MenuBar").OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        (_a = this.menus[newFocusedIndex].buttonElement) === null || _a === void 0 ? void 0 : _a.focus();
      }
    }
  }
  focusNext() {
    var _a;
    if (!this.focusedMenu || this.numMenusShown === 0) {
      return;
    }
    let newFocusedIndex = (this.focusedMenu.index + 1) % this.numMenusShown;
    if (this.focusedMenu.index === _get__("MenuBar").OVERFLOW_INDEX) {
      newFocusedIndex = 0;
    } else if (this.focusedMenu.index === this.numMenusShown - 1) {
      newFocusedIndex = _get__("MenuBar").OVERFLOW_INDEX;
    }
    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }
    if (this.isOpen) {
      this.cleanupMenu();
      this.showMenu(newFocusedIndex);
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      if (newFocusedIndex === _get__("MenuBar").OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        (_a = this.menus[newFocusedIndex].buttonElement) === null || _a === void 0 ? void 0 : _a.focus();
      }
    }
  }
  updateMnemonicVisibility(visible) {
    if (this.menus) {
      this.menus.forEach(menuBarMenu => {
        if (menuBarMenu.titleElement && menuBarMenu.titleElement.children.length) {
          const child = menuBarMenu.titleElement.children.item(0);
          if (child) {
            child.style.textDecoration = this.options.alwaysOnMnemonics || visible ? 'underline' : '';
          }
        }
      });
    }
  }
  get mnemonicsInUse() {
    return this._mnemonicsInUse;
  }
  set mnemonicsInUse(value) {
    this._mnemonicsInUse = value;
  }
  get shouldAltKeyFocus() {
    if (_get__("platform_1").isMacintosh) {
      return false;
    }
    if (!this.options.disableAltFocus) {
      return true;
    }
    if (this.options.visibility === 'toggle') {
      return true;
    }
    return false;
  }
  get onVisibilityChange() {
    return this._onVisibilityChange.event;
  }
  get onFocusStateChange() {
    return this._onFocusStateChange.event;
  }
  onMenuTriggered(menuIndex, clicked) {
    if (!this.menus[menuIndex].actions) {
      _get__("electron_1").ipcRenderer.send('menu-event', menuIndex + 1);
      return;
    }
    if (this.isOpen) {
      if (this.isCurrentMenu(menuIndex)) {
        this.setUnfocusedState();
      } else {
        this.cleanupMenu();
        this.showMenu(menuIndex, this.openedViaKeyboard);
      }
    } else {
      this.focusedMenu = {
        index: menuIndex
      };
      this.openedViaKeyboard = !clicked;
      this.focusState = _get__("MenubarState").OPEN;
    }
  }
  onModifierKeyToggled(modifierKeyStatus) {
    const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey && !modifierKeyStatus.metaKey;
    if (this.options.visibility === 'hidden') {
      return;
    }
    // Prevent alt-key default if the menu is not hidden and we use alt to focus
    if (modifierKeyStatus.event && this.shouldAltKeyFocus) {
      if (_get__("keyCodes_1").ScanCodeUtils.toEnum(modifierKeyStatus.event.code) === 159 /* ScanCode.AltLeft */) {
        modifierKeyStatus.event.preventDefault();
      }
    }
    // Alt key pressed while menu is focused. This should return focus away from the menubar
    if (this.isFocused && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
      this.setUnfocusedState();
      this.mnemonicsInUse = false;
      this.awaitingAltRelease = true;
    }
    // Clean alt key press and release
    if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
      if (!this.awaitingAltRelease) {
        if (!this.isFocused && this.shouldAltKeyFocus) {
          this.mnemonicsInUse = true;
          this.focusedMenu = {
            index: this.numMenusShown > 0 ? 0 : _get__("MenuBar").OVERFLOW_INDEX
          };
          this.focusState = _get__("MenubarState").FOCUSED;
        } else if (!this.isOpen) {
          this.setUnfocusedState();
        }
      }
    }
    // Alt key released
    if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
      this.awaitingAltRelease = false;
    }
    if (this.options.enableMnemonics && this.menus && !this.isOpen) {
      this.updateMnemonicVisibility(!this.awaitingAltRelease && modifierKeyStatus.altKey || this.mnemonicsInUse);
    }
  }
  isCurrentMenu(menuIndex) {
    if (!this.focusedMenu) {
      return false;
    }
    return this.focusedMenu.index === menuIndex;
  }
  cleanupMenu() {
    var _a, _b, _c;
    if (this.focusedMenu) {
      // Remove focus from the menus first
      if (this.focusedMenu.index === _get__("MenuBar").OVERFLOW_INDEX) {
        this.overflowMenu.buttonElement.focus();
      } else {
        (_a = this.menus[this.focusedMenu.index].buttonElement) === null || _a === void 0 ? void 0 : _a.focus();
      }
      if (this.focusedMenu.holder) {
        (_b = this.focusedMenu.holder.parentElement) === null || _b === void 0 ? void 0 : _b.classList.remove('open');
        this.focusedMenu.holder.remove();
      }
      (_c = this.focusedMenu.widget) === null || _c === void 0 ? void 0 : _c.dispose();
      this.focusedMenu = {
        index: this.focusedMenu.index
      };
    }
  }
  showMenu(menuIndex, selectFirst = true) {
    var _a, _b, _c;
    const actualMenuIndex = menuIndex >= this.numMenusShown ? _get__("MenuBar").OVERFLOW_INDEX : menuIndex;
    const customMenu = actualMenuIndex === _get__("MenuBar").OVERFLOW_INDEX ? this.overflowMenu : this.menus[actualMenuIndex];
    if (!customMenu.actions || !customMenu.buttonElement) {
      return;
    }
    const menuHolder = _get__("$")('.cet-menubar-menu-container', {
      title: ''
    });
    customMenu.buttonElement.classList.add('open');
    const titleBoundingRect = customMenu.buttonElement.getBoundingClientRect();
    const titleBoundingRectZoom = _get__("DOM").getDomNodeZoomLevel(customMenu.buttonElement);
    if (this.options.compactMode === _get__("menu_1").Direction.Right) {
      menuHolder.style.top = `${titleBoundingRect.top}px`;
      menuHolder.style.left = `${titleBoundingRect.left + this.container.clientWidth}px`;
    } else if (this.options.compactMode === _get__("menu_1").Direction.Left) {
      menuHolder.style.top = `${titleBoundingRect.top}px`;
      menuHolder.style.right = `${this.container.clientWidth}px`;
      menuHolder.style.left = 'auto';
    } else {
      menuHolder.style.top = `${titleBoundingRect.bottom * titleBoundingRectZoom}px`;
      menuHolder.style.left = `${titleBoundingRect.left * titleBoundingRectZoom}px`;
    }
    customMenu.buttonElement.appendChild(menuHolder);
    const menuOptions = {
      // getKeyBinding: this.options.getKeybinding,
      // actionRunner: this.actionRunner,
      enableMnemonics: this.options.alwaysOnMnemonics || this.mnemonicsInUse && this.options.enableMnemonics,
      ariaLabel: (_a = customMenu.buttonElement.getAttribute('aria-label')) !== null && _a !== void 0 ? _a : undefined
      // expandDirection: this.isCompact ? this.options.compactMode : Direction.Right,
      // useEventAsContext: true
    };
    const menuWidget = this._register(new (_get__("menu_1").CETMenu)(menuHolder, this.menuIcons, this.currentOptions, menuOptions, this.closeMenu));
    menuWidget.createMenu((_c = (_b = customMenu.actions) === null || _b === void 0 ? void 0 : _b.items) !== null && _c !== void 0 ? _c : []);
    menuWidget.applyStyle(this.menuStyle);
    this._register(menuWidget.onDidCancel(() => {
      this.focusState = _get__("MenubarState").FOCUSED;
    }));
    if (actualMenuIndex !== menuIndex) {
      menuWidget.trigger(menuIndex - this.numMenusShown);
    } else {
      menuWidget.focus(selectFirst);
    }
    this.focusedMenu = {
      index: actualMenuIndex,
      holder: menuHolder,
      widget: menuWidget
    };
  }
}
exports.MenuBar = _get__("MenuBar");
_get__("MenuBar").OVERFLOW_INDEX = -1;
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
    case "__createBinding":
      return __createBinding;
    case "__setModuleDefault":
      return __setModuleDefault;
    case "__importStar":
      return __importStar;
    case "DOM":
      return DOM;
    case "MenubarState":
      return MenubarState;
    case "event_1":
      return event_1;
    case "async_1":
      return async_1;
    case "platform_1":
      return platform_1;
    case "keyboardEvent_1":
      return keyboardEvent_1;
    case "consts_1":
      return consts_1;
    case "$":
      return $;
    case "touch_1":
      return touch_1;
    case "mouseEvent_1":
      return mouseEvent_1;
    case "menu_1":
      return menu_1;
    case "MenuBar":
      return MenuBar;
    case "lifecycle_1":
      return lifecycle_1;
    case "strings":
      return strings;
    case "electron_1":
      return electron_1;
    case "keyCodes_1":
      return keyCodes_1;
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
  switch (variableName) {
    case "MenubarState":
      return MenubarState = _value;
  }
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